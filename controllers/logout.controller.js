const User = require("../models/user.model.js");
const ApiResponse = require("../utils/ApiResponse.js");
const asyncHandler = require("../utils/asyncHandler.js");

const handleLogout = asyncHandler(async (req, res) => {
  // //On client also delete accessToken
  // const cookies = req.cookies;
  // if (!cookies?.jwt) return res.sendStatus(204); //No Content
  // const refreshToken = cookies.jwt;
  // // is refresh token in db?
  // const findUser = await User.findOne({ refreshToken }).exec();
  // if (!findUser) {
  //   res.clearCookie("jwt", { httpOnly: true, secure: true });
  //   return res.sendStatus(204);
  // }
  // findUser.username = "";
  // const result = await findUser.save();
  // // console.log(result);
  console.log("req.user", req.user);

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 }, // Unset the refreshToken field &  this removes the field from document
    },
    { new: true, runValidators: true }
  );

  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  }); //* secure -true
  return res
    .status(204)
    .json(new ApiResponse(200, {}, "User logged out successfully."));
  // return res.sendStatus(204); //*
});
module.exports = { handleLogout };
