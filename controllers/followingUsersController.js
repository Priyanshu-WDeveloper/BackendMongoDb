const axios = require("axios");
const FollowingUser = require("../model/FollowingUser");

const getFollowingUsers = async (req, res) => {
  try {
    const response = await axios.get("https://randomuser.me/api/?results=5");
    const followingUsers = response.data.results;

    //
    const savedUsers = [];
    for (const user of followingUsers) {
      const existing = await FollowingUser.findOne({
        "login.uuid": user.login.uuid,
      });
      if (!existing) {
        const savedUser = await FollowingUser.create(user);
        savedUsers.push(savedUser);
      }
    }
    res.status(200).json({
      message: "Users imported (without duplicates) into MongoDB!",
      users: savedUsers,
    });
    // await FollowingUser.insertMany(followingUsers);
    // res
    //   .status(200)
    //   .json({ message: "Random users imported into MongoDB!", followingUsers });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to fetch random Users");
  }
};
module.exports = { getFollowingUsers };
