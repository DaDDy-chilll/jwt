const jwt = require("jsonwebtoken");
const checkToken = (req, res, next) => {
  const { accessToken } = req.cookies;
  if (!accessToken) {
    return res.json({
      success: false,
      data: "Token Not Found",
    });
  }
  jwt.verify(accessToken, "secret", (e, data) => {
    if (e) {
      console.log(e.message);
      return res.json({
        success: false,
        data: e.message,
      });
    }
    req.user = data;
    // console.log(res.user);
    next();
  });
};

module.exports = checkToken;
