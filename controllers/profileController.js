const User = require("../models/userModel");
const { validationResult } = require("express-validator");
const axios = require("axios");

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

exports.getAddress = async(req,res) => {
  const {lat,lng} = req.query;
  // fetch('/get-address?...') send a query parameter that's why user req.query instead of req.body
  try{
    const response = await axios.get(
       `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
       {
        headers : {
          "User-Agent": "book-marketplace-app"
        }
       }
    );
    const addr = response.data.address;
    res.json({
      city: addr.city || addr.town || addr.village || "",
      pincode: addr.postcode || "",
      fullAddress : response.data.display_name || ""
    });
  }catch(err){
    console.log(err);
    res.status(500).json({ errror: "Failed" });
  }
}
