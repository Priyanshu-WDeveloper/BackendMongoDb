// import mongoose from "mongoose";
const mongoose = require("mongoose");

const pincodeSchema = new mongoose.Schema({
  pincode: { type: String, required: true, unique: true },
  area: { type: String, required: true },
  message: { type: String, required: true },
  etaDays: { type: Number, required: true },
  codAvailable: { type: Boolean, default: false },
  expressAvailable: { type: Boolean, default: false },
});

module.exports = mongoose.model("Pincode", pincodeSchema);
