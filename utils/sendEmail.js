const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
});

module.exports = async( to, subject, html) => {
    try{
      await transporter.sendMail({
        to: to,
        subject: subject,
        html: html
      });
      console.log("Email sent to:",to);  
    }catch(err){
      console.log("email error",err);
    }
}