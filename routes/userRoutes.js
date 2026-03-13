const express = require('express');
const userRouter = express.Router();

const userControllers = require('../controllers/userControllers');

userRouter.get("/home",userControllers.getUserHome);

module.exports = userRouter;