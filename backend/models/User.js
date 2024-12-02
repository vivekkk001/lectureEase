const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Added name field
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true }); // Added timestamps for createdAt and updatedAt

module.exports = mongoose.model('User', userSchema);
