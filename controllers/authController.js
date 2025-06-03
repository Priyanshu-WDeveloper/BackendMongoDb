const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const handleLogin = async (req, res) => {
  const cookies = req.cookies;
  // console.log("Cookies", cookies);

  const { user, pwd } = req.body;

  if (!user || !pwd)
    return res
      .status(400)
      .json({ message: "Username and Password are dd required." });
  const findUser = await User.findOne({ username: user }).exec(); // instead of find() use findOne()
  // console.log("findUser", findUser);

  if (!findUser) return res.sendStatus(401); // Unauthorized
  const match = await bcrypt.compare(pwd, findUser.password);
  if (match) {
    const roles = Object.values(findUser.roles).filter(Boolean);
    //* Creating JWT
    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: findUser.username,
          roles: roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15sec" }
    );
    const newRefreshToken = jwt.sign(
      { username: findUser.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "20sec" }
    );
    //* Saving refresh token with current user
    const existingTokens = Array.isArray(findUser.refreshToken)
      ? findUser.refreshToken
      : [];

    let newRefreshTokenArray;

    if (!cookies?.jwt) {
      newRefreshTokenArray = existingTokens;
    } else {
      newRefreshTokenArray =
        existingTokens?.filter((rt) => rt !== cookies.jwt) || [];
    }

    // 🛡 Defensive programming: Ensure refreshToken is always an array
    // findUser.refreshToken = Array.isArray(findUser.refreshToken)
    //   ? findUser.refreshToken
    //   : [];
    // let newRefreshTokenArray = !cookies?.jwt
    //   ? findUser.refreshToken
    //   : findUser.refreshToken.filter((rt) => rt !== cookies.jwt);

    if (cookies?.jwt) {
      /*
      Scenario added here
      1) User logs in but never uses RT and does not logout
      2) RT is stolen
      3) If 1 & 2, reuse detection is needed to clear all RTs when user logs in
      */
      const refreshToken = cookies.jwt;
      const findToken = await User.findOne({ refreshToken }).exec();
      // Detected refresh token reuse!
      if (!findToken) {
        // console.log(
        //   `Detected refresh token reuse for user: ${findUser.username}`
        // );
        // clear out all previous refresh tokens
        newRefreshTokenArray = [];
        return res.sendStatus(401);
      }
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
    }
    // Saving refreshToken with current user
    // findUser.refreshToken = newRefreshTokenArray
    findUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];

    // findUser.accessToken = accessToken;
    const result = await findUser.save();
    // console.log(result);
    // Creates Secure Cookie with refresh token
    res.cookie("jwt", newRefreshToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });
    res.json({ accessToken }); //? accessToken not refreshToken
  } else {
    res.sendStatus(401);
  }
  // console.log(`[LOGIN SUCCESS] User: ${user} @ ${new Date().toISOString()}`);
};

module.exports = { handleLogin };
