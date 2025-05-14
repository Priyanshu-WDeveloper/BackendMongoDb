const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader) return res.sendStatus(401);
  // console.log(authHeader);
  const token = authHeader.split(" ")[1];
  // console.log("TOKEN", token);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decode) => {
    if (err) return res.sendStatus(403); //*Invalid Token
    req.userName = decode.UserInfo.userName;
    req.roles = decode.UserInfo.roles;
    next();
  });
};
module.exports = verifyJWT;
