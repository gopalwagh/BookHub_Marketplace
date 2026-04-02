const User = require("../models/userModel");
const { validationResult } = require("express-validator");

exports.getProfile = async (req, res) => {
  try {
    const userId = req.session.user.id;

    const userData = await User.findById(userId);

    res.render("profile", {
      pageTitle: "My Profile",
      userData,
      user: req.session.user,
      errors: []
    });

  } catch (err) {
    console.log(err);
    res.send("Error loading profile");
  }
};

exports.postProfile = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const userId = req.session.user.id;
    const existingUser = await User.findById(userId);

    // 🔥 Extract error fields
    const errorFields = errors.array().map(err => err.path);

    // 🔥 Merge logic
    const userData = {
      firstName: existingUser.firstName,
      email: existingUser.email,

      phone: errorFields.includes("phone") ? "" : req.body.phone,
      address: errorFields.includes("address") ? "" : req.body.address,
      city: errorFields.includes("city") ? "" : req.body.city,
      pincode: errorFields.includes("pincode") ? "" : req.body.pincode
    };

    return res.render("profile", {
      pageTitle: "My Profile",
      userData,
      user: req.session.user,
      errors: errors.array()
    });
  }

  // ✅ success case
  const userId = req.session.user.id;
  await User.findByIdAndUpdate(userId, {
    phone: req.body.phone,
    address: req.body.address,
    city: req.body.city,
    pincode: req.body.pincode
  });

  res.redirect("/profile");
};