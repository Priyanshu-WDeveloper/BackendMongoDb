const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const followingUserSchema = new Schema({
  gender: String,
  name: {
    title: String, // Mr, Mrs, Ms, Dr
    first: String,
    last: String,
  },
  login: {
    uuid: { type: String, unique: true },
    username: String,
    // other fields
  },
  email: String,
  picture: {
    large: String,
    medium: String,
    thumbnail: String,
  },
  location: {
    city: String,
    country: String,
  },
});

module.exports = mongoose.model("FollowingUser", followingUserSchema);
