const Feedback = require('../models/Feedback');

// Create feedback
exports.createFeedback = async (req, res) => {
  try {
    const feedback = new Feedback(req.body);
    await feedback.save();
    res.status(201).json(feedback);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all feedback
exports.getAllFeedback = async (req, res) => {
  const feedbacks = await Feedback.find().sort({ createdAt: -1 });
  res.json(feedbacks);
};

// Delete feedback
exports.deleteFeedback = async (req, res) => {
  await Feedback.findByIdAndDelete(req.params.id);
  res.json({ message: 'Feedback deleted' });
};

// Reply to feedback
exports.replyFeedback = async (req, res) => {
  const { reply } = req.body;
  const feedback = await Feedback.findByIdAndUpdate(
    req.params.id,
    { reply },
    { new: true }
  );
  res.json(feedback);
};

// Download feedback (all or by rating)
exports.downloadFeedback = async (req, res) => {
  const { rating } = req.query;
  const filter = rating ? { rating: Number(rating) } : {};
  const feedbacks = await Feedback.find(filter);
  // Convert to CSV or JSON as needed
  res.json(feedbacks);
};