const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/user.model.js");
const ApiResponse = require("../utils/ApiResponse.js");
const generateAccessAndRefereshTokens = require("../utils/sendToken.utils.js");
const asyncHandler = require("../utils/asyncHandler.js");
const ApiError = require("../utils/ApiError.js");

const handleRefresh = asyncHandler(async (req, res) => {
  const cookies = req.cookies;
  // console.log("cookie0", cookies.jwt);
  if (!cookies?.jwt) return res.sendStatus(403); //Forbidden
  // console.log("cookie1", cookies.jwt);
  const refreshToken = cookies?.jwt;
  // console.log("cookie2", refreshToken);
  // res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });

  const findUser = await User.findOne({ refreshToken })
    .select("+refreshToken")
    .exec();

  if (!findUser) {
    // jwt.verify(
    //   refreshToken,
    //   process.env.REFRESH_TOKEN_SECRET,
    //   async (err, decoded) => {
    //     if (err) return res.sendStatus(403);
    //     //Delete refresh tokens of hacked user

    //     // const hackedUser = await User.findOne({
    //     //   username: decoded.username,
    //     // }).exec();
    //     // hackedUser.refreshToken = [];
    //     // const result = await hackedUser.save();

    //     await User.findOneAndUpdate(
    //       { username: decoded.username },
    //       { $set: { refreshToken: [] } }
    //     );
    //   }
    // );
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );

      // If valid, clean up any potential tokens for this username
      const findd = await User.findOneAndUpdate(
        { _id: decoded.id },
        { $set: { refreshToken: [] } }
      );
    } catch (verifyErr) {
      console.log("Token verification failed:", verifyErr.message);
      // We don't need to do anything here, just continue
    }
    // Regardless of token validity, no user was found so we deny access
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
    // return res.sendStatus(403);
    throw new ApiError(
      403,
      "Detected refresh token reuse. Please login again."
    );
  }

  const newRefreshTokenArray = findUser.refreshToken.filter(
    (rt) => rt !== refreshToken //refreshToken is the current refresh token that you're trying to remove (maybe it’s expired, reused, or stolen).
  );

  //evaluate jwt
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decode) => {
      if (err) {
        // return res.sendStatus(403);
        // expored refresh token
        findUser.refreshToken = [...newRefreshTokenArray];
        await findUser.save();
        throw new ApiError(
          403,
          "Detected refresh token reuse. Please login again."
        );
        // return res.sendStatus(403); //added here
      }
      // if (err || findUser.username !== decode.username) {
      if (!decode) {
        console.log("Username mismatch or decode undefined");
        return res.sendStatus(403);
      }
      if (findUser._id.toString() !== decode.id) {
        throw new ApiError(403, "Refresh token does not match user");
      }
      // Refresh token was still valid
      const roles = Object.values(findUser.roles);

      // const accessToken = jwt.sign(
      //   {
      //     id: findUser._id,
      //     // UserInfo: {
      //     // username: decode.username,
      //     // roles: roles,
      //     // },
      //   },
      //   process.env.ACCESS_TOKEN_SECRET,
      //   { expiresIn: process.env.ACCESS_TOKEN_EXPIRY } // Default to 15 minutes if not set
      // );

      // Token is valid - generate new tokens
      const { accessToken, refreshToken: newRefreshToken } =
        await generateAccessAndRefereshTokens(findUser._id);
      // console.log("accessToken", accessToken);
      // console.log("refreshToken", newRefreshToken);
      // console.log("refreshToken", refreshToken);

      // const newRefreshToken = jwt.sign(
      //   { username: findUser.username },
      //   process.env.REFRESH_TOKEN_SECRET
      //       { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" } // Default to 7 days if not set
      // //   { expiresIn: "15sec" }
      // );
      // Saving refreshToken with current user
      await User.findByIdAndUpdate(
        findUser._id,
        { $set: { refreshToken: [...newRefreshTokenArray, newRefreshToken] } }, // newRefreshTokenArray remove the request body but preserve the rest and newRefreshToken Array is the new refresh token that going to the user
        { new: true }
      );
      // Save new refresh token and remove old one
      // findUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
      // const result = await findUser.save({ validateBeforeSave: false });
      // console.log(result);
      const user = await User.findById(findUser._id).select(
        "-password -refreshToken"
      );
      // // Creates Secure Cookie with refresh token
      res.cookie("jwt", newRefreshToken, {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
      res
        .status(200)
        .json(
          new ApiResponse(200, { user, accessToken }, "Access token refreshed")
        );
    }
  );
});
module.exports = { handleRefresh };
