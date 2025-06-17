const User = require("../models/user.model.js");
const ApiError = require("./ApiError.js");

const generateAccessAndRefereshTokens = async (
  // it is only for login purposes
  userId,
  existingRefreshTokens = []
) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError("User not found");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // // Maintain the array structure for multiple devices
    // const refreshTokenArray = Array.isArray(existingRefreshTokens)
    //   ? [...existingRefreshTokens, refreshToken]
    //   : [refreshToken];
    // 🔄 Preserve existing tokens if they exist
    // user.refreshToken = refreshTokenArray; // Store the refresh token in the user document //! this store only one refreshToken (i.e wipe out all the previous ones)
    let existingTokens = Array.isArray(user.refreshToken)
      ? user.refreshToken
      : [];
    // ✅ Add the new token to the list
    const updatedTokens = [...existingTokens, refreshToken];

    // 🔐 Optional: Deduplicate tokens
    user.refreshToken = [...new Set(updatedTokens)];

    await user.save({ validateBeforeSave: false }); // Save the user document with the new refresh token

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error sending access and refresh tokens:", error);
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};
module.exports = generateAccessAndRefereshTokens;
