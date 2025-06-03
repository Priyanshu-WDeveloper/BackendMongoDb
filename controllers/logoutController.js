const User = require("../model/User");

const handleLogout = async (req, res) => {
  //On client also delete accessToken
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); //No Content
  const refreshToken = cookies.jwt;
  // is refresh token in db?
  const findUser = await User.findOne({ refreshToken }).exec();
  if (!findUser) {
    res.clearCookie("jwt", { httpOnly: true, secure: true });
    return res.sendStatus(204);
  }
  findUser.username = "";
  const result = await findUser.save();
  // console.log(result);

  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  }); //* secure -true
  return res.sendStatus(204); //*
};
module.exports = { handleLogout };
