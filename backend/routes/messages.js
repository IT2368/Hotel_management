import express from "express";
import { Message } from "../models/Message.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Create a new message
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { type, priority, subject, message, department } = req.body;
    
    const newMessage = new Message({
      sender: req.user._id,
      type,
      priority,
      subject,
      message,
      department,
      status: 'pending'
    });

    await newMessage.save();
    
    // Notify manager about the new message (you can implement this)
    // await notifyManager(newMessage);
    
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
});

// Get all messages for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const messages = await Message.find({ 
      $or: [
        { sender: req.user._id },
        { recipient: req.user._id }
      ]
    }).sort({ createdAt: -1 });
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
});

// Get a message by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: 'Message not found' });
    // Authorization: sender or recipient can view
    if (
      msg.sender?.toString() !== req.user._id.toString() &&
      msg.recipient?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(msg);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching message', error: error.message });
  }
});

// Update a message (e.g., manager response or status change)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const update = req.body;
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: 'Message not found' });
    // Allow sender to update their own message content/status before manager response
    // Managers/admins could update status/response in your role checks (not implemented here)
    if (msg.sender?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    Object.assign(msg, update);
    await msg.save();
    res.json(msg);
  } catch (error) {
    res.status(500).json({ message: 'Error updating message', error: error.message });
  }
});

// Delete a message
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: 'Message not found' });
    if (msg.sender?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await msg.deleteOne();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting message', error: error.message });
  }
});

export default router;
