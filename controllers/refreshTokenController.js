const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../model/User");

const handleRefresh = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(403); //Forbidden
  // console.log(cookies.jwt);
  const refreshToken = cookies.jwt;
  // console.log(refreshToken);

  const findUser = await User.findOne({ refreshToken }).exec();
  if (!findUser) return res.sendStatus(403);

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decode) => {
    if (err || findUser.username !== decode.username) {
      return res.sendStatus(403);
    }
    const roles = Object.values(findUser.roles);
    const accessToken = jwt.sign(
      {
        UserRoles: {
          username: decode.username,
          roles: roles,
        },
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "15m" }
    );
    res.json({ accessToken });
  });
};
module.exports = { handleRefresh };
