const User = require("../models/userModel");

module.exports = async(req,res,next) => {
    const user = await User.findById(req.session.user._id);
    if(!user.isVerified){
        console.log("email is ot verified ")
        return res.send("Please verify yout email first");
    }
    next();
}