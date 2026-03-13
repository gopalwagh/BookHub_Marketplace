exports.getUserHome = (req,res,next) => {
    res.render("role/user",{
        pageTitle : "User DashBoard",
        user : req.session.user
    })
}