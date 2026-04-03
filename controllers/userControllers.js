const Book = require("../models/bookModel");
const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const PDFDocument = require("pdfkit");

exports.getUserHome = (req,res,next) => {
    res.render("role/user/user",{
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
        
        res.render("role/user/user_books",{
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
        res.render("role/user/book_details",{
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
        return res.render("role/user/cart",{
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
    
    res.render("role/user/cart",{
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
            }else{
                book.stock -= item.quantity;
                await book.save();
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
                quantity: item.quantity,
                price: item.bookId.price,
                photoUrl: item.bookId.photoUrl,
                title: item.bookId.title
            };
        });
        const order = new Order({
            userId,
            items,
            totalAmount: total,
            status: "pending"
        });
        await order.save();
        
        await Cart.findOneAndDelete({ userId });
        req.session.success = "✅ Order placed successfully!";
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
    const successMessage = req.session.success || null;
    req.session.success = null;    
    res.render("role/user/orders",{
        pageTitle: "Confirm Order",
        orders,
        successMessage
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

    res.render("role/user/checkout", {
      pageTitle:"CheckOut",
      items,
      total
    });

  }catch(err) {
    console.log(err);
    res.send("Error loading checkout");
  }
};

exports.getInvoice = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId).populate("items.bookId");

    if (!order) return res.send("Order Not Found");
    if (order.userId.toString() !== req.session.user.id) {
        console.log("UserId doesNot matched")
      return res.send("Unauthorized");
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${orderId}.pdf`
    );

    doc.pipe(res);

    // ================= HEADER =================
    doc
      .rect(0, 0, 612, 80)
      .fill("#2C3E50");

    doc
      .fillColor("#ffffff")
      .fontSize(26)
      .text(" BookHub", 50, 30);

    doc
      .fontSize(12)
      .text("Your Trusted Book Marketplace", 50, 55);

    doc.moveDown(3);

    // ================= INVOICE TITLE =================
    doc
      .fillColor("#2C3E50")
      .fontSize(20)
      .text("INVOICE", { align: "right" });

    doc.moveDown();

    // ================= ORDER INFO =================
    doc
      .fontSize(11)
      .fillColor("black")
      .text(`Order ID: ${order._id}`)
      .text(`Date: ${new Date(order.createdAt).toDateString()}`);

    doc.moveDown(2);

    // ================= TABLE HEADER =================
    const tableTop = doc.y;

    doc
      .rect(50, tableTop, 500, 25)
      .fill("#ECF0F1");

    doc
      .fillColor("#2C3E50")
      .fontSize(12)
      .text("Book", 60, tableTop + 7)
      .text("Qty", 260, tableTop + 7)
      .text("Price", 320, tableTop + 7)
      .text("Total", 420, tableTop + 7);

    let position = tableTop + 30;
    let totalAmount = 0;

    // ================= ITEMS =================
    order.items.forEach((item) => {
      const book = item.bookId;
      const itemTotal = book.price * item.quantity;
      totalAmount += itemTotal;

      doc
        .fillColor("black")
        .fontSize(11)
        .text(book.title, 60, position, { width: 180 })
        .text(item.quantity.toString(), 260, position)
        .text(`₹${book.price.toFixed(2)}`, 320, position)
        .text(`₹${itemTotal.toFixed(2)}`, 420, position);

      // row line
      doc
        .moveTo(50, position + 20)
        .lineTo(550, position + 20)
        .strokeColor("#BDC3C7")
        .stroke();

      position += 30;
    });

    // ================= TOTAL BOX =================
    doc.moveDown();

    doc
      .rect(350, position + 10, 200, 40)
      .fill("#2C3E50");

    doc
      .fillColor("#ffffff")
      .fontSize(14)
      .text("Grand Total", 360, position + 20)
      .text(`₹${totalAmount.toFixed(2)}`, 460, position + 20);

    position += 70;

    // ================= SELLER INFO =================
    doc
      .fillColor("#2C3E50")
      .fontSize(12)
      .text("Seller: BookHub Marketplace", 50, position);

    doc.moveDown(2);

    // ================= FOOTER =================
    doc
      .moveTo(50, 750)
      .lineTo(550, 750)
      .strokeColor("#7F8C8D")
      .stroke();

    doc
      .fontSize(10)
      .fillColor("#7F8C8D")
      .text(
        "Thank you for shopping with BookHub ❤️ | support@bookhub.com",
        50,
        760,
        { align: "center" }
      );

    doc.end();
  } catch (err) {
    console.log(err);
    res.redirect("/user/orders");
  }
};