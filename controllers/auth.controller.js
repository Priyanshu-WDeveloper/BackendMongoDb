const User = require("../models/user.model.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const generateAccessAndRefereshTokens = require("../utils/sendToken.utils.js");

const handleLogin = asyncHandler(async (req, res, next) => {
  const cookies = req.cookies;
  // console.log("Cookies", cookies);

  let { username, email, password } = req.body;
  let phone = req.body.phone;

  // Clean and normalize inputs, convert empty strings to null
  username = username && username.trim() ? username.toLowerCase().trim() : null;
  email = email && email.trim() ? email.toLowerCase().trim() : null;

  // if (!username || !password)
  if (!(username || email || phone) || !password)
    throw new ApiError(
      400,
      "Username, Email or Phone and Password are required."
    );

  const orConditions = [];
  if (username) orConditions.push({ username: username });
  if (email) orConditions.push({ email: email });
  if (phone) orConditions.push({ phone: phone });

  let findUser = null;
  if (orConditions.length > 0) {
    findUser = await User.findOne({ $or: orConditions })
      .select("+password +refreshToken")
      .exec();
  }
  // const findUser = await User.findOne({ username: username }).exec(); // instead of find() use findOne()
  // console.log("findUser", findUser);
  if (!findUser) throw new ApiError(401, "User does not exist"); // Unauthorized

  // const match = await bcrypt.compare(password, findUser.password);
  const match = await findUser.isPasswordCorrect(password);
  if (!match) throw new ApiError(401, "Invalid user credentils");

  if (match) {
    // const roles = Object.values(findUser.roles).filter(Boolean);
    //* Creating JWT
    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefereshTokens(findUser._id);
    // const newRefreshToken = jwt.sign(
    //   { id: findUser._id },
    //   process.env.REFRESH_TOKEN_SECRET,
    //   { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    // );

    //* Saving refresh token with current user
    let newRefreshTokenArray = Array.isArray(findUser.refreshToken)
      ? [...findUser.refreshToken]
      : [];
    console.log("newRefreshTokenArray", newRefreshTokenArray);

    // const existingTokens = Array.isArray(findUser.refreshToken)
    //   ? findUser.refreshToken
    //   : [];
    // let newRefreshTokenArray;
    // if (!cookies?.jwt) {
    //   newRefreshTokenArray = existingTokens;
    // } else {
    //   newRefreshTokenArray =
    //     existingTokens?.filter((rt) => rt !== cookies.jwt) || [];
    //   console.log(
    //     " Existing tokens found, filtering out existing token",
    //     newRefreshTokenArray
    //   );
    // }

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
      // const refreshToken = cookies.jwt;
      // const user = await User.findOne({ username: "piyush123" })

      const cookieRefreshToken = cookies.jwt;
      // Clear old cookie early
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });

      const findToken = await User.findOne(
        {
          refreshToken: { $in: [cookieRefreshToken] }, //problem in sendTokens
        },
        { refreshToken: 1 }
      ).exec();
      // .select("+refreshToken") //problem in sendTokens
      // const findToken = await User.findOne({
      //   refreshToken: { $in: [refreshToken] },
      // })
      // .select("+refreshToken")
      // .exec();

      // Detected refresh token reuse or old/invalid token!
      if (!findToken) {
        console.log(
          "Old or invalid refresh token found in cookies - clearing it"
        );
        // Clear the old cookie and reset refresh tokens for security
        newRefreshTokenArray = [];
        await User.findByIdAndUpdate(findUser._id, {
          $set: { refreshToken: [] },
        });

        // Update user to clear tokens
        // await User.findByIdAndUpdate(
        //   findUser._id,
        //   {
        //     $pull: { refreshToken: cookies.jwt },
        //   },
        //   { new: true }
        // );
        throw new ApiError(
          403, // or 401
          `Detected refresh token reuse for user! Please login again or Logout first` //TODO !solve this error
        );
      }
      // Token was valid, remove it from array to replace with new one
      newRefreshTokenArray = newRefreshTokenArray.filter(
        (rt) => rt !== cookieRefreshToken
      );
    }
    // Saving refreshToken with current user
    // findUser.refreshToken = newRefreshTokenArray
    // findUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];

    // findUser.accessToken = accessToken;
    // await findUser.save();//VersionError: No matching document found for id "68449e094ab06f538e007c20" version 10 modifiedPaths "refreshToken"

    await User.findByIdAndUpdate(
      findUser._id,
      {
        $set: {
          refreshToken: [...newRefreshTokenArray, newRefreshToken],
        },
      },
      { new: true } // {new:true} returns the updated document
    );
    //   { new: true, runValidators: true } // {new:true} returns the updated document

    // Creates Secure Cookie with refresh token
    const loggedInUser = await User.findById(findUser._id);
    res.cookie("jwt", newRefreshToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    res.status(200).json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken }, //refreshToken only temporary here
        "Login successful"
      )
    );
  } else {
    throw new ApiError(401, "Unauthorized"); // Unauthorized
  }
});

module.exports = { handleLogin };
