const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new Schema(
  {
    username: {
      type: String,
      // lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    firstName: String,
    lastName: String,
    countryCode: {
      type: String,
      trim: true,
    },
    nationalNumber: {
      type: String,
      trim: true,
    },
    roles: {
      User: {
        type: Number,
        default: 2001,
      },
      Admin: Number,
      Editor: Number,
    },
    password: {
      type: String,
      required: true,
    },
    refreshToken: [String], // String is for single User but [String] is for multiple users/devices
  },
  { timestamps: true }
);

// Create indexes with sparse option to allow multiple null values
userSchema.index({ username: 1 }, { unique: true, sparse: true });
userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ phone: 1 }, { unique: true, sparse: true });
userSchema.index({ nationalNumber: 1 }, { unique: true, sparse: true });

// // Create a compound index for phone number uniqueness
// userSchema.index(
//   { countryCode: 1, nationalNumber: 1 },
//   {
//     unique: true,
//     sparse: true, // Allows documents that don't have these fields
//     name: "phone_number_unique",
//   }
// );
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   this.password = await bcrypt.hash(this.password, 10);
// next()
// });

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// userSchema.methods, toJSON: function () {
//   const obj = this.toObject();
//   delete obj.password; // Remove password from the output
//   delete obj.refreshToken; // Remove refreshToken from the output
//   return obj;

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this._id,
      username: this.username,
      email: this.email,
      phone: this.phone,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};

// const roles = Object.values(this.roles).filter(Boolean);
// return jwt.sign(
//   {
//     UserInfo: {
//       username: this.username,
//       roles: roles,
//     },
//   },
//   process.env.ACCESS_TOKEN_SECRET,
//   { expiresIn: "15m" }
// );

module.exports = mongoose.model("User", userSchema);
