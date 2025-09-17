const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: String,
  email: String,
  message: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 },
  reply: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
