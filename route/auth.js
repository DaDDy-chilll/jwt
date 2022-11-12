const express = require("express");
const jwt = require("jsonwebtoken");
const checkToken = require("../middleware/token.middleware");
const authRouter = express.Router();

const users = [
  { id: 1, email: "userone@gmail.com", password: "abc123", isAdmin: false },
  { id: 2, email: "usertwo@gmail.com", password: "123abc", isAdmin: false },
  { id: 3, email: "admin@gmail.com", password: "kmd123", isAdmin: true },
];

let refresh_Token = [];
authRouter.post("/login", (req, res) => {
  //check from db
  const { email, password } = req.body;
  // console.log(email, password);
  const findUser = users.find(
    (u) => u.email == email && u.password == password
  );
  // console.log(findUser);
  if (!findUser) {
    return res.json({
      success: false,
      data: "Email and password doesn't match",
    });
  }
  //refresh token
  const accessToken = jwt.sign(
    {
      user_id: findUser.id,
      email: findUser.email,
      isAdmin: findUser.isAdmin,
    },
    "secret",
    { expiresIn: "3s" }
  );
  const refreshToken = jwt.sign(
    {
      user_id: findUser.id,
      email: findUser.email,
      isAdmin: findUser.isAdmin,
    },
    "refresh_secret"
  );
  refresh_Token.push(refreshToken);
  //auth token
  res.cookie("accessToken", accessToken, { httpOnly: true });
  res.cookie("refreshToken", refreshToken, { httpOnly: true });
  res.json({
    success: true,
    data: {
      user_id: findUser.id,
      email: findUser.email,
      isAdmin: findUser.isAdmin,
    },
  });
  //user
});

authRouter.post("/logout", checkToken, (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({
    success: true,
    data: "Logout",
  });
});

authRouter.delete("/user/:id", checkToken, (req, res) => {
  const { id } = req.params;
  console.log(req.user.user_id);
  if (id == req.user.user_id || req.user.isAdmin === true) {
    return res.status(200).json({
      success: true,
      data: "Deleted account",
    });
  }
  return res.status(400).json({
    error: false,
    data: "Autharization Fail!",
  });
});

authRouter.post("/refresh", (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return res.status(400).json({
      error: false,
      data: "Refresh Token Not Found",
    });
  }
  const findRefreshToken = refresh_Token.find((t) => t == refreshToken);
  if (!findRefreshToken) {
    return res.status(400).json({
      error: false,
      data: "Refresh Token Not Found in our database",
    });
  }
  jwt.verify(refreshToken, "refresh_secret", (e, data) => {
    if (e) {
      return res.status(400).json({
        error: false,
        data: "Refresh Token Invalid",
      });
    }
    const newAccessToken = jwt.sign(
      {
        user_id: data.user_id,
        email: data.email,
        isAdmin: data.isAdmin,
      },
      "secret",
      { expiresIn: "10m" }
    );
    const newRefreshToken = jwt.sign(
      {
        user_id: data.user_id,
        email: data.email,
        isAdmin: data.isAdmin,
      },
      "refresh_secret"
    );
    refresh_Token = refresh_Token.filter((t) => t != refreshToken);
    refresh_Token.push(newRefreshToken);
    //auth token
    res.cookie("accessToken", newAccessToken, { httpOnly: true });
    res.cookie("refreshToken", newRefreshToken, { httpOnly: true });
    res.json({
      success: true,
      data: {
        user_id: data.user_id,
        email: data.email,
        isAdmin: data.isAdmin,
      },
    });
  });
});

module.exports = authRouter;
