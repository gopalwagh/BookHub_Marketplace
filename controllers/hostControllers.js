const Book = require("../models/bookModel");

exports.getDashboard = async (req,res) => {
  
  if(!req.session.user || req.session.user.role !== "host"){
    return res.redirect("/login");
  }

  const ownerId = req.session.user.id;
  
  const books = await Book.find({owner : ownerId})
  const totalBooks = books.length;;
  const lowStockBooks = books.filter(book => book.stock <5);
  const outOfStockBooks = books.filter(book => book.stock === 0);
 
  let totalIntventoryValue = 0;
  books.forEach(book => {
    totalIntventoryValue += book.price * book.stock;
  });

  const authors = await Book.distinct("author",{owner: ownerId});
  const totalAuthors = authors.length;

  const recentBooks = await Book.find({owner: ownerId})
  .sort({createdAt : -1})
  .limit(5);

  res.render("role/host",{
    pageTitle :"Host DashBoard",
    user : req.session.user,
    totalBooks,
    lowStockBooks,
    outOfStockBooks,
    totalAuthors,
    totalIntventoryValue,
    recentBooks
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
  const photoUrl = "/uploads/" + req.file.filename;
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

  const ownerId = req.session.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = 16;
  const skip = (page-1)*limit;

  const sortOption = req.query.sort;
  let sort = {};

  switch (sortOption) {
    case "priceLow":
      sort.price = 1;
      break;
    case "priceHigh":
      sort.price = -1;
      break;
    case "nameAZ":
      sort.title = 1;
      break;
    case "nameZA":
      sort.title = -1;
      break;
    default:
      break;
  }
  
  const totalBooks = await Book.countDocuments({ owner: ownerId});

  const books = await Book.find({ owner : ownerId })
  .sort(sort)
  .skip(skip)
  .limit(limit)

  const totalPages = Math.ceil(totalBooks/limit);

  res.render("role/my-books",{
    pageTitle : "My Books",
    books,
    totalPages,
    currentPage : page,
    sortOption
  })
}

exports.getLogout = (req,res) => {
  console.log("ya it's work")
  res.redirect("/login")
}

exports.getEditBook = async (req,res,next) => {
  const bookId = req.params.id;
  const book = await Book.findById(bookId);

  res.render("role/edit-book",{
    pageTitle : "Edit Book",
    book
  });
};

exports.postEditBook = async(req,res) => {
  const {title,author,price,stock} = req.body;
  const bookId = req.params.id;
  await Book.findByIdAndUpdate(bookId,{
    title,
    author,
    price,
    stock
  });
  res.redirect("/host/books")
}

exports.postDeleteBook = async (req,res) => {
  const bookId = req.params.id;
  console.log("Deleting book:", bookId);
  const bookdeleted = await Book.findByIdAndDelete(bookId);
  console.log("Book deleted successfully",bookdeleted);
  
  res.redirect("/host/books");
}