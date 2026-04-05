const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const { verifyTemplate, resetTemplate } = require("../utils/emailTemplates");

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
  if (!user.isVerified) {
    req.session.message = "Please verify your email first";
    return res.redirect("/resend-verification");
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
  try{
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
    
    // new token generate 
    const token = crypto.randomBytes(32).toString("hex");

    await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      isVerified: false,
      verificationToken: token,
      verificationExpiry: Date.now()+ 3600000
    });

    // verification link
    const link = `http://localhost:3000/verify/${token}`;

    await sendEmail(
      email,
      "Verify your BookHub account 📚",
      verifyTemplate(firstName,link)
      );

    req.session.message = "Account created successfully. Please login.";
    res.redirect("/login");
  }catch(err){
    console.log("postsignup get's failed",err);
    res.redirect("/signup");
  }
};

exports.getVerify = async (req,res) => {
  try{
    const user = await User.findOne({
      verificationToken : req.params.token,
      verificationExpiry: {$gt : Date.now()}
    }); 
    if(!user){
      return res.send("Invalid or Expired Verification Link");
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpiry = undefined;
    
    await user.save();
    req.session.message = "Email verified SuccessFully. Please login";

    res.redirect("/login");
  }catch(err){
    console.log("get verfy get failed",err);
    res.redirect("/login");
  }
}

exports.getForgotPassword = (req,res) => {
  res.render("auth/forgot-password",{
    message : req.session.message || "",
    pageTitle: "Forgot_password"
  });
  req.session.message = null;
}

exports.postForgotPassword = async (req,res) => {
  const {email} = req.body;
  const user = await User.findOne({ email });
  if(!user){
    return res.redirect("/forgot-password");
  }
  console.log("Email:", email);
console.log("User:", user);

  // only verified User ke liye
  if(!user.isVerified){
    req.session.message = "Please verify your Email first";
    return res.redirect("/login");
  }
  const token = crypto.randomBytes(32).toString("hex");
  user.resetToken = token;
  user.resetTokenExpiry = Date.now() + 3600000;
  await user.save();

  const link =  `http://localhost:3000/reset/${token}`;
console.log("Link:", link);
  await sendEmail(
    email,
  "Reset your BookHub password 🔐",
  `
  <h2>Hello ${user.firstName}</h2>
  <p>Click below to reset your password:</p>
  <a href="${link}">Reset Password</a>
  `
  );
  req.session.message = "Reset Link sent to your email";
  res.redirect("/login");
}

exports.getResetPassword = async (req,res) => {
  const user = await User.findOne({
    resetToken: req.params.token,
    resetTokenExpiry: { $gt: Date.now() }
  });
  if(!user){
    return res.send("Invalid or Expired token");
  }
  res.render("auth/reset-password",{
    token: req.params.token,
    pageTitle: "Reset_password"
  });
}

exports.postResetPassword = async (req,res) => {
  const {password, confirmPassword } = req.body;
  if(password !== confirmPassword){
    return res.send("Password does not Match");
  }
  const user = await User.findOne({
    resetToken: req.params.token,
    resetTokenExpiry: { $gt : Date.now() }
  });
  if(!user){
    return res.send("Invalid or expired token")
  }
  const hashedPassword = await bcrypt.hash(password, 12);

  user.password = hashedPassword;
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;

  await user.save();

  req.session.message = "Password updated successfully";
  res.redirect("/login");
};

exports.getResendVerification = (req, res) => {
  res.render("auth/resend-verification", {
    message: req.session.message || "",
    pageTitle: "Verify-Email"
  });
  req.session.message = null;
};

exports.postResendVerification = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    req.session.message = "No account with this email";
    return res.redirect("/resend-verification");
  }
  if (user.isVerified) {
    req.session.message = "Email already verified. Please login.";
    return res.redirect("/login");
  }
  const token = crypto.randomBytes(32).toString("hex");

  user.verificationToken = token;
  user.verificationExpiry = Date.now() + 3600000;
  await user.save();
  const link = `http://localhost:3000/verify/${token}`;

  await sendEmail(
    email,
   "Verify your BookHub account 📚",
    verifyTemplate(user.firstName, link)
  );
  req.session.message = "Verification email sent again";
  res.redirect("/login");
};