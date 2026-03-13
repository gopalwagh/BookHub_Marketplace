const express = require('express');
const homerouter = express.Router();

const homeController = require("../controllers/homeController");

homerouter.get("/", homeController.getHome);

module.exports = homerouter;