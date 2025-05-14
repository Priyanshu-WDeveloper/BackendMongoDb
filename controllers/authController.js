const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const handleLogin = async (req, res) => {
  const { user, pwd } = req.body;

  if (!user || !pwd)
    return res
      .status(400)
      .json({ message: "Username and Password are dd required." });
  const findUser = await User.findOne({ username: user }).exec(); // instead of find() use fondOne()
  if (!findUser) return res.sendStatus(401);
  const match = await bcrypt.compare(pwd, findUser.password);
  if (match) {
    const roles = Object.values(findUser.roles);
    //* Creating JWT
    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: findUser.username,
          roles: roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      { username: findUser.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
    //* Saving refresh token with current user
    findUser.accessToken = accessToken;
    const result = await findUser.save();
    console.log(result);

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });
    res.json({ accessToken }); //? accessToken not refreshToken
  } else {
    res.sendStatus(401);
  }
};
module.exports = { handleLogin };
