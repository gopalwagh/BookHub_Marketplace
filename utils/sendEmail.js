const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,         
  secure: false,     
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