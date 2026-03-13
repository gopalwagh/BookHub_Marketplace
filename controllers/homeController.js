const User = require("../models/userModel");
const Book = require("../models/bookModel");

exports.getHome = async (req,res) => {

  if(req.session.user){
   if(req.session.user.role === "host"){
      return res.redirect("/host/dashboard");
   }
   if(req.session.user.role === "user"){
      return res.redirect("/user/home");
   }
  }

  const totalStores = await User.countDocuments({role:"host"});
  const totalUsers = await User.countDocuments({role:"user"});

  res.render("home",{
    pageTitle:"Home",
    totalStores,
    totalUsers,
    totalBooks:0
  });

};