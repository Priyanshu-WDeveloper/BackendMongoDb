const User = require("../model/User");

const getAllUsers = async (req, res) => {
  const users = await User.find();
  if (!users) return res.status(204).json({ message: "No Users Found" });
  res.json(users);
};

// const updateEmployee = async (req, res) => {
//   if (!req?.body?.id) {
//     return res.status(400).json({ message: "Id parameter is required." });
//   }
//   const employee = await Employee.findOne({ _id: req.body.id }).exec();
//   if (!employee) {
//     return res
//        .status(204)
//       .json({ message: `No Employee matches Id ${req.body.id} ` });
//   }
//   if (req.body?.firstname) employee.firstname = req.body.firstname;
//   if (req.body?.lastname) employee.lastname = req.body.lastname;
//   const result = await employee.save();
//   res.json(result);
// };
const deleteUser = async (req, res) => {
  if (!req?.body?.id) {
    return res.status(400).json({ message: "Id parameter is required." });
  }
  const user = await User.findOne({ _id: req.body.id }).exec();
  if (!user) {
    return res
      .status(204)
      .json({ message: `No User matches Id ${req.body.id} ` });
  }
  const result = await user.deleteOne({ _id: req.body.id });
  res.json(result);
};
const getUser = async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ message: "Id parameter is required." });
  }
  const user = await User.findOne({ _id: req.params.id }).exec();
  if (!user) {
    return res
      .status(204)
      .json({ message: `User Id ${req.params.id} not found` });
  }
  res.json(user);
};
module.exports = {
  getAllUsers,
  deleteUser,
  getUser,
};
