const PORT = 3000;
const expresss = require("express");
const cookie = require("cookie-parser");
const app = expresss();
const authRouter = require("./route/auth");

app.use(expresss.json());
app.use(cookie());
app.use("/api", authRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port:${PORT}`);
});
