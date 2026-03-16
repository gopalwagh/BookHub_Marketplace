const express = require('express');


const authRouter = express.Router();
const authController = require('../controllers/authControllers');

authRouter.get("/login",authController.getLogin);
authRouter.get("/signup",authController.getSignup);

authRouter.post("/login", authController.postLogin);
authRouter.post("/signup",authController.postSignup);

module.exports = authRouter;