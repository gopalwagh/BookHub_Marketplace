const express = require('express');
const hostRouter = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const hostControllers = require("../controllers/hostControllers");

hostRouter.get("/dashboard", hostControllers.getDashboard);
hostRouter.get("/add-book", hostControllers.getAddBook);
hostRouter.post("/add-book", upload.single("photo"), hostControllers.postAddBook);
hostRouter.get("/books", hostControllers.getMyBooks);
hostRouter.get("/logout", hostControllers.getLogout);

module.exports = hostRouter;