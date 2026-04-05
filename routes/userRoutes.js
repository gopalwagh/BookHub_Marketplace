const express = require('express');
const multer = require('multer');
const isAuth = require("../middlewares/isAuth");
const userRouter = express.Router();
const upload = multer({ dest: "uploads/" });

const userControllers = require('../controllers/userControllers');

userRouter.get("/home",userControllers.getUserHome);
userRouter.get("/books",userControllers.getAllbooks);
userRouter.get("/books/:bookId",userControllers.getBookDetails);
userRouter.get("/cart",userControllers.getCart);
userRouter.get("/checkout",isAuth,userControllers.getCheckout);
userRouter.get("/orders",isAuth,userControllers.getOrders);
userRouter.get("/:orderId/invoice",isAuth,userControllers.getInvoice);

userRouter.post("/order",isAuth,userControllers.postOrder);
userRouter.post("/cart/add",isAuth,userControllers.postAddToCart);
userRouter.post("/cart/remove",isAuth,userControllers.postRemoveFromCart);

module.exports = userRouter;