const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

exports.getLogin = (req, res) => {
  res.render("login", {
    pageTitle: "Login"
  });
};

exports.getSignup = (req, res) => {
  res.render("signup", {
    pageTitle: "Signup"
  });
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    req.session.message = "Email not found";
    return res.redirect("/signup");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    req.session.message = "Invalid password";
    return res.redirect("/login");
  }

  console.log("User successfully found in database");
  req.session.user = {
    id : user._id.toString(),
    name : user.firstName,
    role :user.role,
  }
  req.session.isLoggedIn = true;
  console.log("session_user",req.session.user )
  res.redirect("/");
};

exports.postSignup = async (req, res) => {

  const { firstName, lastName, email, password, confirmPassword, role } = req.body;

  if (password !== confirmPassword) {
    req.session.message = "Password does not match";
    return res.redirect("/signup");
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    req.session.message = "Email already registered";
    return res.redirect("/login");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    role
  });

  req.session.message = "Account created successfully. Please login.";
  res.redirect("/login");
};