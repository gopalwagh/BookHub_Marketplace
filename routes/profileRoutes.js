const express = require("express");
const { profileValidation } = require("../models/profileValidator");
const profileController = require("../controllers/profileController");
const isAuth = require("../middlewares/isAuth");

const profileRouter = express.Router();

profileRouter.get("/profile", isAuth, profileController.getProfile);
profileRouter.get("/get-address",profileController.getAddress);

profileRouter.post("/profile", isAuth, profileValidation, profileController.postProfile);

module.exports = profileRouter;