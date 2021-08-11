const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    const verifyUser = await jwt.verify(token, process.env.SECRET_KEY);
    const userdetail = await userModel.findOne({ _id: verifyUser._id });
    req.user = userdetail;
    req.token = token;
    next();
  } catch (err) {
    res.redirect('/');
  }
};

module.exports = auth;
