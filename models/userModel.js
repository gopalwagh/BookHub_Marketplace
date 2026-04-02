const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },

  lastName: {
    type: String
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["user", "host"],
    required: true
  },

  // 🔥 PROFILE FIELDS
  phone: {
    type: String
  },

  address: {
    type: String
  },

  city: {
    type: String
  },

  pincode: {
    type: String
  },
  
  profileImage: {
    type: String // multer image path
  }

}, {
  timestamps: true 
});

module.exports = mongoose.model("User", userSchema);