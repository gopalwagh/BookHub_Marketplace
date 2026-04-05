const Book = require("../models/bookModel");
const Order = require("../models/orderModel");
const { orderShippedTemplate, orderDeliveredTemplate } = require("../utils/emailTemplates");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/userModel");

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

  res.render("role/host/host",{
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

  res.render("role/host/add-book",{
    pageTitle : "Add Book"
  });
}

exports.postAddBook = async (req,res) => {
  const { title, author, price, stock, description} = req.body;
  const photoUrl = "/uploads/" + req.file.filename;
  const ownerId = req.session.user.id;
  const categories = req.body.categories ? req.body.categories
    .split(", ")
    .map(c =>c.trim().toLowerCase())
    .filter(c => c.length>0)
    : [];
  // fallback logic   
  if(categories.length==0)  {
    categories = ["general"];
  }
  await Book.create({
    title,
    author,
    description,
    price,
    stock,
    photoUrl,
    categories,
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

  res.render("role/host/my-books",{
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

  res.render("role/host/edit-book",{
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

exports.getHostOrders = async (req,res) => {
  try{
    const hostId = req.session.user.id;
    const books = await Book.find({ owner : hostId });
    const bookIds = books.map(book => book._id.toString());
    const orders = await Order.find()
      .populate("items.bookId")
      .populate("userId")
      .sort({ createdAt: -1 })
    const filterOrders = [];
    orders.forEach(order => {
      const items = order.items.filter(item => item.bookId && bookIds.includes(item.bookId._id.toString()));
      if(items.length >0){
        filterOrders.push({
          ...order._doc,
          items
        });
      }
    });
    res.render("role/host/host_orders",{
      pageTitle: "Host Orders",
      orders : filterOrders,
      user: req.session.user
    })
  }catch(err){
    console.log(err);
    res.send("Error Loading host Order")
  }
}

exports.postUpdateOrderStatus = async(req,res) => {
  try{
    const { orderId, status } = req.body;
    // ismai order fetch ho raaha hai
    const order = await Order.findById(orderId);
    if(!order) return res.send("Order not Found");
    // status update logic
    order.status = status;
    await order.save();
    // User fetch karo
    const user = await User.findById(order.userId);
    if(status === "shipped"){
      await sendEmail(user.email,
        "Your order has been shipped 🚚",
        orderShippedTemplate(user.firstName,order._id)
      );
    }
    if(status === "delivered"){
      await sendEmail(user.email,
        "Order delivered 🎉",
        orderDeliveredTemplate(user.firstName,order._id)
      );
    }
    res.redirect("/host/orders");
  }catch(err){
    console.log(err);
    res.send("Error Updating status");  
  }
}
