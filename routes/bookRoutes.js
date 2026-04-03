const express =  require("express");
const bookController = require("../controllers/bookControllers");

const bookRouter = express.Router();

bookRouter.get("/search-books",bookController.searchBooks);

module.exports = bookRouter;