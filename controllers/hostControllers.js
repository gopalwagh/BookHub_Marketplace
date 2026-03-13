const Book = require("../models/bookModel");

exports.getDashboard = async (req,res,next) => {
  
  if(!req.session.user || req.session.user.role !== "host"){
    return res.redirect("/login");
  }

  const ownerId = req.session.user.id;

  const totalBooks = await Book.countDocuments({ owner: ownerId });

  const lowStockBooks = await Book.find({
    owner: ownerId,
    stock: { $lt: 5 }
  });

  const outOfStockBooks = await Book.find({
    owner: ownerId,
    stock: 0
  });

  res.render("role/host",{
    pageTitle :"Host DashBoard",
    user : req.session.user,
    totalBooks,
    lowStockBooks,
    outOfStockBooks
  });
};

exports.getAddBook = (req,res) => {
  if(!req.session.user){
    return res.redirect("/login");
  }

  res.render("role/add-book",{
    pageTitle : "Add Book"
  });
}

exports.postAddBook = async (req,res) => {
  const { title, author, price, stock} = req.body;
  const photoUrl = req.file.path;
  const ownerId = req.session.user.id;

  await Book.create({
    title,
    author,
    price,
    stock,
    photoUrl,
    owner : ownerId
  })
  res.redirect("/host/books");
}

exports.getMyBooks = async (req,res) => {
  console.log("My BOOKS RoUTE HIT");
  
  const books = await Book.find({
    owner : req.session.user.id
  });

  res.render("role/my-books",{
    pageTitle : "My Books",
    books
  })
}

exports.getLogout = (req,res) => {
  console.log("ya it's work")
  res.redirect("/login")
}