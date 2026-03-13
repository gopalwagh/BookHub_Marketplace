const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true 
    },
    author :{
        type : String,
        required : true
    },
    price :{
        type :Number,
        required : true,
        default : 0
    },
    stock : {
        type : Number,
        required : true,
        default : 0
    },
    owner : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required: true
    }
})

module.exports = mongoose.model("Book",bookSchema);