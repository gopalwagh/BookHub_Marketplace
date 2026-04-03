const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: String,
  items: [
    {
      bookId:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "Book"
      },
      title: String,
      price: Number,
      photoUrl: String,
      quantity: Number
    }
  ],
  totalAmount: Number,
  createdAt: {
    type: Date,
    default: Date.now
  },
  status: String
});

module.exports = mongoose.model("Order", orderSchema);