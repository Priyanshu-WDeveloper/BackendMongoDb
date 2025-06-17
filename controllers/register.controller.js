const User = require("../models/user.model.js");
const bcrypt = require("bcrypt");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const handleNewUser = asyncHandler(async (req, res, next) => {
  console.log(req.body);

  try {
    let { username, email, password, phone, countryCode, nationalNumber } =
      req.body;
    // Clean and normalize inputs, convert empty strings to null
    if (username === null) console.log("UsernameNull", username);
    if (username === undefined) console.log("UsernameUND", username);

    username =
      username && username.trim() && username !== undefined
        ? username.toLowerCase().trim()
        : undefined;
    email = email && email.trim() ? email.toLowerCase().trim() : undefined;
    // let phone = req.body.phone;
    // const cleanField = (field) =>
    //   typeof field === "string" && field.trim() !== "" ? field.trim() : undefined;

    // const username = cleanField(req.body.username)?.toLowerCase();
    // const email = cleanField(req.body.email)?.toLowerCase();
    // const phone = cleanField(req.body.phone);
    // const countryCode = cleanField(req.body.countryCode);
    // const nationalNumber = cleanField(req.body.nationalNumber);
    if (!password) {
      throw new ApiError(400, "Password is required.");
    }

    // let phone;
    // let countryCode;
    // let nationalNumber;
    // if (phone) {
    //   phone =
    //     phone.phone && phone.phone.trim() ? phone.phone.trim() : null;
    //   countryCode =
    //     phone.countryCode && phone.countryCode.trim()
    //       ? phone.countryCode.trim()
    //       : null;
    //   nationalNumber =
    //     phone.nationalNumber && phone.nationalNumber.trim()
    //       ? phone.nationalNumber.trim()
    //       : null;
    // }

    // Check if at least one identifier is provided
    if (!(username || email || phone)) {
      throw new ApiError(400, "Username, Email or Phone is required.");
    }

    // Build query conditions for duplicate check
    const orConditions = [];

    // Only check for duplicates if the field is provided and not null
    if (username) orConditions.push({ username: username });
    if (email) orConditions.push({ email: email });
    if (phone) orConditions.push({ phone: phone });

    // Only perform duplicate check if we have conditions
    let duplicate = null;
    if (orConditions.length > 0) {
      duplicate = await User.findOne({ $or: orConditions }).exec();
    }

    if (duplicate) {
      // Provide more specific error message
      let errorMessage = "Registration failed: ";

      // Check each field safely
      if (username && duplicate.username && duplicate.username === username) {
        errorMessage += "Username already taken.";
      } else if (email && duplicate.email && duplicate.email === email) {
        errorMessage += "Email already taken.";
      } else if (
        (phone && duplicate.phone && duplicate.phone === phone) ||
        (nationalNumber &&
          duplicate.nationalNumber &&
          duplicate.nationalNumber === nationalNumber)
      ) {
        errorMessage += "Phone number already registered.";
      } else {
        errorMessage += "User information already taken.";
      }

      throw new ApiError(409, errorMessage);
    }

    // Encrypt the password
    const hashedPwd = await bcrypt.hash(password, 10);

    // Prepare user data for creation
    const userData = {
      password: hashedPwd,
      username: username,
      email: email,
      phone: phone,
      countryCode: countryCode,
      nationalNumber: nationalNumber,
    };

    //     const userData = {
    //   password: hashedPwd,
    //   // Only add fields if they exist and are not empty strings
    //   ...(email && email.trim() !== '' ? { email } : {}),
    //   ...(username && username.trim() !== '' ? { username } : {}),
    //   ...(phone ? { phone } : {}),
    //   // ...other fields
    // };
    //     const userData = {
    //   password: hashedPwd,
    //   ...(username ? { username } : {}),
    //   ...(email ? { email } : {}),
    //   ...(phone ? { phone } : {}),
    //   ...(countryCode ? { countryCode } : {}),
    //   ...(nationalNumber ? { nationalNumber } : {}),
    // };

    // Only add fields if they are provided and not null/undefined
    // Important: Don't add fields with null values to avoid index issues
    // if (username) userData.username = username;
    // if (email) userData.email = email;
    // if (phone) userData.phone = phone;
    // if (countryCode) userData.countryCode = countryCode;
    // if (nationalNumber) userData.nationalNumber = nationalNumber;

    // Create and store the new user
    const result = await User.create(userData);
    // console.log("User created successfully:", result);

    // const createdUser = await User.findById(result._id).select(
    //   "-password -refreshToken"
    // ); // not user._id

    // // console.log("Created User:", createdUser);

    // if (!createdUser) {
    //   throw new ApiError(
    //     500,
    //     "Something went wrong while registering the user"
    //   );
    // }

    return res
      .status(201)
      .json(new ApiResponse(200, result, "User registered successfully"));
    // .json(new ApiResponse(200, createdUser, "User registered successfully"));
  } catch (error) {
    console.error("Error creating user:", error);
    if (error instanceof ApiError) {
      return next(error);
    }
    return next(
      new ApiError(
        500,
        error.message || "Something went wrong while registering the user"
      )
    );
    // throw new ApiError(
    //   500,
    //   error.message || "Something went wrong while registering the user"
    // );
    // return res.status(500).json({ message: error.message });
  }
});

module.exports = { handleNewUser };
