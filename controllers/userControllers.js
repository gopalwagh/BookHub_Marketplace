const Book = require("../models/bookModel");
const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");

exports.getUserHome = (req,res,next) => {
    res.render("role/user",{
        pageTitle : "User DashBoard",
        user : req.session.user
    })
}

exports.getAllbooks = async(req,res) => {
    try{
        console.log(req.query);
        const page = parseInt(req.query.page) || 1;
        const limit = 16;
        const skip = (page - 1) * limit;

        const category = req.query.category || "";
        const search = req.query.search || "";
        const sortOption = req.query.sort || "lastest";
        
        const query = {};
        if(search){
            query.title = { $regex: search, $options : "i"};
        }
        if(category){
            query.category = category;
        }

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
        
        const totalBooks = await Book.countDocuments(query);
        const totalPages = Math.ceil(totalBooks/limit);

        if(page > totalPages && totalPages > 0){
            return res.redirect(`/user/books?page=${totalPages}`);
        }

        const books = await Book.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit);
        console.log(query);
        res.render("role/user_books",{
            pageTitle: "Browse Books",
            books,
            search,
            currentPage : page,
            totalPages,
            hasNextPage: page <  totalPages,
            hasPreviousPage : page>1,
            nextPage : page +1,
            previousPage :page-1,
            category,
            sortOption,
            user: req.session.user
        });
    }catch(err){
        console.log(err);
        res.send("Error Loading books");     
    }
} 

exports.getBookDetails = async(req,res)=> {
    try{
        const bookId = req.params.bookId;
        const book = await Book.findById(bookId);
        if(!book){
            return res.send("Book not found");
        }
        const relatedBooks = await Book.find({
            category: book.category,
            _id: {$ne : bookId}
        }).limit(4);
        res.render("role/book_details",{
            pageTitle: book.title,
            book,
            relatedBooks,
            user: req.session.user
        });
    }
    catch(err){
        console.log(err);
        res.send("Error Loading Book");
    }
}

exports.postAddToCart = async (req,res) => {
    const userId = req.session.user.id;
    const bookId = req.body.bookId;

    let cart = await Cart.findOne({ userId });
    if (!cart) {
        cart = new Cart({
            userId,
            items: []
        });
    }
    const existingIndex = cart.items.findIndex(
        item => item.bookId.toString() === bookId
    );
    if (existingIndex >= 0) {
        cart.items[existingIndex].quantity += 1;
    } else {
        cart.items.push({ bookId, quantity: 1 });
    }
    const errorMessage = req.session.error;
    await cart.save();
    res.redirect("/user/cart");
}

exports.getCart = async (req,res) => {
    const userId = req.session.user.id;
    const cart = await Cart.findOne({userId}).populate("items.bookId");
    const errorMessage = req.session.error || null;
    req.session.error = null;
    if(!cart || cart.items.length===0){
        return res.render("role/cart",{
            pageTitle:"Your Cart",
            items:[],
            total:0,
            errorMessage
        });
    }
    let total = 0;
    const items = cart.items.map(item => {
        total += item.bookId.price * item.quantity;
        return {
            ...item.bookId._doc,
            quantity: item.quantity
        };
    });
    
    res.render("role/cart",{
        pageTitle:"Your Cart",
        items,
        total,
        errorMessage
    })
};

exports.postRemoveFromCart = async (req,res,next) => {
    const userId = req.session.user.id;
    const bookId = req.body.bookId;
    const cart = await Cart.findOne({ userId });
    
    cart.items = cart.items.filter(item => item.bookId.toString()!== bookId
    );
    await cart.save();
    res.redirect("/user/cart");
}

exports.postOrder = async(req,res,next)=>{
    try{
        const userId = req.session.user.id;
        const cart = await Cart.findOne({ userId }).populate("items.bookId");
        if(!cart || cart.items.length===0){
            return res.redirect("/user/cart");
        }
        const outOfStockItems = [];
        for(let item of cart.items){
            const book = item.bookId;
            if(book.stock < item.quantity){
               outOfStockItems.push(`${book.title} (Available: ${book.stock})`);
            }
        }
        if( outOfStockItems.length > 0){
            req.session.error = `❌ These books are out of stock: ${outOfStockItems.join(", ")}`;
            return res.redirect("/user/cart");
        }
        let total = 0;
        const items = cart.items.map(item => {
            total += item.bookId.price * item.quantity;
            return {
                bookId: item.bookId._id,
                quantity: item.quantity
            };
        });
        const order = new Order({
            userId,
            items,
            totalAmount: total,
            status: "pending"
        });
        await order.save();
        for(let item of cart.items){
            await Book.findByIdAndUpdate(item.bookId._id,{
                $inc: { stock: item.quantity }
            });
        }
        await Cart.findOneAndDelete({ userId });
        res.redirect("/user/orders");
    }catch(err){
        console.log(err);
        res.send("Error placing Order");
    }
};

exports.getOrders = async(req,res) =>{
    const userId = req.session.user.id;
    const orders = await Order.find({ userId })
        .populate("items.bookId")
        .sort({ createdAt:-1 });
    res.render("role/orders",{
        pageTitle: "Confirm Order",
        orders
    });
}

exports.getCheckout = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const cart = await Cart.findOne({ userId })
        .populate("items.bookId")

    if (!cart || cart.items.length === 0) {
      return res.render("role/checkout", {
        pageTitle: "Checkout",
        items: [],
        total: 0
      });
    }
    let total = 0;
    const items = cart.items.map(item => {
        total += item.bookId.price * item.quantity;
        return {
            ...item.bookId._doc,
            quantity: item.quantity
        };
    });

    res.render("role/checkout", {
      pageTitle:"CheckOut",
      items,
      total
    });

  } catch (err) {
    console.log(err);
    res.send("Error loading checkout");
  }
};