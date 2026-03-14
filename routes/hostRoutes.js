const express = require('express');
const multer = require("multer");

const upload = multer({ dest: "uploads/" });
const hostRouter = express.Router();

const hostControllers = require("../controllers/hostControllers");

hostRouter.get("/dashboard", hostControllers.getDashboard);
hostRouter.get("/add-book", hostControllers.getAddBook);
hostRouter.get("/books", hostControllers.getMyBooks);
hostRouter.get("/logout", hostControllers.getLogout);
hostRouter.get("/edit-book/:id", hostControllers.getEditBook);

hostRouter.post("/add-book", upload.single("photo"), hostControllers.postAddBook);
hostRouter.post("/edit-book/:id",hostControllers.postEditBook);
hostRouter.post("/delete-book/:id", hostControllers.postDeleteBook);

module.exports = hostRouter;