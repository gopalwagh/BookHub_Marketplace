const express = require('express');


const authrouter = express.Router();
const authController = require('../controllers/authControllers');

authrouter.get("/login",authController.getLogin);
authrouter.get("/signup",authController.getSignup);

authrouter.post("/login", authController.postLogin);
authrouter.post("/signup",authController.postSignup);

module.exports = authrouter;