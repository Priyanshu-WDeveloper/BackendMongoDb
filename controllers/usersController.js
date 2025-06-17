const LogEvents = require("../middleware/userLogEvents.middleware.js");
const User = require("../models/user.model.js");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");
const asyncHandler = require("../utils/asyncHandler.js");

const getAllUsers = asyncHandler(async (req, res) => {
  // console.log("getAllUsers", req.body);
  const limit = parseInt(req.query.limit) || 0;
  const skip = parseInt(req.query.skip) || 0;

  // Get total count before applying limit and skip
  const totalCount = await User.countDocuments();

  const users = await User.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .select("-password -refreshToken");
  if (!users) throw new ApiError(204, "No Users Found");
  // LogEvents(`💀${users}`, "AllUsers.txt");
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { list: users, totalCount: totalCount },
        "Users Retrieved Successfully"
      )
    );
  // .json(new ApiResponse(200, users, "Users Retrieved Successfully"));
});

const updateUser = asyncHandler(async (req, res) => {
  // console.log("UPDATE BODY", req.body);
  const { id } = req.params;
  if (!id) throw new ApiError(400, "Id parameter is required.");

  const user = await User.findOne({ _id: id })
    .select("-password -refreshToken")
    .exec();
  if (!user) throw new ApiError("User Not Found");

  // Define allowed fields for update (matching your User schema)
  const allowedUpdates = [
    "username",
    "email",
    "phone",
    "firstName",
    "lastName",
    "countryCode",
    "nationalNumber",
  ];

  // Update allowed fields
  allowedUpdates.forEach((field) => {
    const value = req.body[field];
    if (value !== undefined && value !== "") {
      user[field] = value.trim?.() || value;
    }
  });

  // Handle roles separately due to nested structure
  if (req.body?.roles) {
    if (req.body.roles.User !== undefined)
      user.roles.User = req.body.roles.User;
    if (req.body.roles.Admin !== undefined)
      user.roles.Admin = req.body.roles.Admin;
    if (req.body.roles.Editor !== undefined)
      user.roles.Editor = req.body.roles.Editor;
  }

  const result = await user.save();
  console.log("Result at update user:", result);
  // LogEvents(`Updated Body:${req.body}\n${result}`, "updatedUser.txt");
  res
    .status(200)
    .json(new ApiResponse(200, result, "User Updated Successfully"));
});
const deleteUser = asyncHandler(async (req, res) => {
  console.log("Delete Body", req.body);
  console.log("Delete user ID", req.body.id);

  if (!req?.body?.id) throw new ApiError(400, "Id parameter is required.");

  const user = await User.findOne({ _id: req.body.id }).exec();
  if (!user) throw new ApiError(204, `No User matches Id ${req.body.id} `);

  const result = await user.deleteOne({ _id: req.body.id });
  console.log("Delete Result", result);

  LogEvents(`UserId: ${user}\n ${JSON.stringify(result)}`, "DeletedUser.txt");

  // res.json(result);
  //*-------------------
  //   app.delete('/api/users/:id', (req, res) => {
  //   const { id } = req.params;
  //   // Delete logic
  // });
  res
    .status(200)
    .json(new ApiResponse(200, result, "User Deleted Successfully"));
});
const getUser = asyncHandler(async (req, res) => {
  if (!req?.params?.id) throw new ApiError(400, "Id parameter is required.");

  const user = await User.findOne({ _id: req.params.id })
    .select("-password -refreshToken")
    .exec();
  if (!user) throw new ApiError("User Not Found");
  // res.json(user);
  // console.log("UserID of single User ", user);
  // LogEvents(`${user}`, "UserById.txt");

  res
    .status(200)
    .json(new ApiResponse(200, user, "User Retrieved Successfully"));
});
module.exports = {
  getAllUsers,
  updateUser,
  deleteUser,
  getUser,
};
