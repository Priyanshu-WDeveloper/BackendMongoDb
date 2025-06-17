const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/user.model.js");
require("dotenv").config();

const decodeToken = (token) => {
  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    console.log("Token verification failed:", err.message);
    if (err.name === "TokenExpiredError") {
      throw new ApiError(403, "Token is expired");
    } else if (err.name === "JsonWebTokenError") {
      throw new ApiError(403, "Token is invalid");
    } else {
      throw new ApiError(403, "Token verification failed");
    }
    //  return res
    //     .status(401)
    //     .json(
    //       new ApiError(401, error.message || "Unauthorized", "Invalid JWT token")
    //     ); //* Unauthorized
  }
};
const verifyJWT = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  //  const authHeader = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

  if (!authHeader) throw new ApiError(401, "Authorization header is missing"); // Unauthorized
  //    const token = req.cookies.jwt;

  const token = authHeader.split(" ")[1];
  if (!token) throw new ApiError(401, "No token found");
  const decodedToken = decodeToken(token); // This will throw an error if token is invalid/expired

  // Handle both 'id' and '_id' for backward compatibility
  const userId = decodedToken?.id || decodedToken?._id;
  console.log("userId in VerifyJWT", userId);

  const user = await User.findById(userId).select("-password -refreshToken");
  console.log("======== req.user in VerifyJWT ========");
  console.log(req.user);
  console.log("================================");
  console.log("======== user in VerifyJWT========");
  console.log(user);
  console.log("================================");

  if (!user) {
    throw new ApiError(401, "Invalid Access Token");
  }

  req.user = user;

  // Extract roles from user and set them on req.roles
  const roles = Object.values(user.roles).filter(Boolean);
  console.log(roles);

  req.roles = roles;

  // console.log("TOKEN", token);

  // jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decode) => {
  //   if (err) return res.sendStatus(403); //*Invalid Token
  // });
  next();
});
module.exports = verifyJWT;
