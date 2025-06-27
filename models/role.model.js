const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  // role_name: {type:String,required:true},
  // role_description: {type:String,required:true},
  // role_status: {type:Boolean,default:true}
  name: {
    type: String,
    required: true,
    unique: true,
  },
  permissions: {
    type: [String],
    default: [],
  },
});

module.exports = mongoose.model("Role", roleSchema);
