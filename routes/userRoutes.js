const express = require('express');
const multer = require('multer');
const isAuth = require("../models/isAuth");
const userRouter = express.Router();
const upload = multer({ dest: "uploads/" });

const userControllers = require('../controllers/userControllers');

userRouter.get("/home",userControllers.getUserHome);
userRouter.get("/books",userControllers.getAllbooks);
userRouter.get("/books/:bookId",userControllers.getBookDetails);
userRouter.get("/cart",userControllers.getCart);
userRouter.get("/checkout",isAuth,userControllers.getCheckout);
userRouter.get("/orders",isAuth,userControllers.getOrders);

userRouter.post("/order",isAuth,userControllers.postOrder);
userRouter.post("/cart/add",isAuth,userControllers.postAddToCart);
userRouter.post("/cart/remove",isAuth,userControllers.postRemoveFromCart);

module.exports = userRouter;