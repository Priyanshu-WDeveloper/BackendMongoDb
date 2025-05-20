const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../model/User");

const handleRefresh = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(403); //Forbidden
  // console.log(cookies.jwt);
  const refreshToken = cookies.jwt;
  // console.log(refreshToken);
  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });

  const findUser = await User.findOne({ refreshToken }).exec();
  // console.log("findUser", findUser); //error here

  // if (!findUser) return res.sendStatus(403);
  if (!findUser) {
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) return res.sendStatus(403);
        //Delete refresh tokens of hacked user
        const hackedUser = await User.findOne({
          username: decoded.username,
        }).exec();
        hackedUser.refreshToken = [];
        const result = await hackedUser.save();
      }
    );
    return res.sendStatus(403);
  }
  // console.log("findUser", findUser.refreshToken);

  const newRefreshTokenArray = findUser.refreshToken.filter(
    (rt) => rt !== refreshToken
  );

  //evaluate jwt

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decode) => {
      // console.log("Decode", decode.username);

      // if (err || findUser.username !== decode.username) {
      if (err) {
        // return res.sendStatus(403);
        // expored refresh token
        findUser.refreshToken = [...newRefreshTokenArray];
        const result = await findUser.save();
      }
      if (err || findUser.username !== decode.username)
        return res.sendStatus(403);
      // Refresh token was still valid
      const roles = Object.values(findUser.roles);
      const accessToken = jwt.sign(
        {
          UserInfo: {
            username: decode.username,
            roles: roles,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );
      const newRefreshToken = jwt.sign(
        { username: findUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "15m" }
      );
      // Saving refreshToken with current user
      findUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
      const result = await findUser.save();
      // Creates Secure Cookie with refresh token
      res.cookie("jwt", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      });
      res.json({ accessToken });
    }
  );
};
module.exports = { handleRefresh };
