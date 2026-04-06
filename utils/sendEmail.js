const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
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