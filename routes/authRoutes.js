const express = require('express');


const authRouter = express.Router();
const authController = require('../controllers/authControllers');

authRouter.get("/login",authController.getLogin);
authRouter.get("/signup",authController.getSignup);

authRouter.post("/login", authController.postLogin);
authRouter.post("/signup",authController.postSignup);

authRouter.get("/verify/:token",authController.getVerify);
authRouter.get("/forgot-password",authController.getForgotPassword);
authRouter.post("/forgot-password",authController.postForgotPassword);

authRouter.get("/reset/:token",authController.getResetPassword);
authRouter.post("/reset/:token",authController.postResetPassword);

authRouter.get("/resend-verification", authController.getResendVerification);
authRouter.post("/resend-verification", authController.postResendVerification);

module.exports = authRouter;