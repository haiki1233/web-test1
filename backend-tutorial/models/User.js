const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  username: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// xuất ra để nơi khác dùng được
module.exports = mongoose.model('User', userSchema);