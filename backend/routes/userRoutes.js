import express from 'express';
import User from '../models/User.js';
import multer from 'multer';
import path from 'path';
import Booking from '../models/Booking.js';

const router = express.Router();

// Multer setup for local uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `user_${req.params.id}_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// Upload profile image endpoint
router.post('/:id/upload-profile-image', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const imageUrl = `/uploads/${req.file.filename}`;
  await User.findByIdAndUpdate(req.params.id, { profileImage: imageUrl });
  res.json({ url: imageUrl });
});

// Update user profile (deep merge for nested fields)
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Update top-level fields
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.nic = req.body.nic || user.nic;
    user.profileImage = req.body.profileImage || user.profileImage;
    user.role = req.body.role || user.role;
    user.emailVerified = req.body.emailVerified ?? user.emailVerified;
    user.isActive = req.body.isActive ?? user.isActive;
    user.isApproved = req.body.isApproved ?? user.isApproved;

    // Update nested fields
    user.address = { ...user.address, ...req.body.address };
    user.idProof = { ...user.idProof, ...req.body.idProof };
    user.preferences = { ...user.preferences, ...req.body.preferences };

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get user by ID (excluding password)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user account
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User account deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all deals for a user
router.get('/:id/deals', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('deals');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.deals || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new deal to a user
router.post('/:id/deals', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.deals.push(req.body);
    await user.save();
    res.status(201).json(user.deals[user.deals.length - 1]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a specific deal for a user
router.put('/:id/deals/:dealId', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const deal = user.deals.id(req.params.dealId);
    if (!deal) return res.status(404).json({ error: 'Deal not found' });
    Object.assign(deal, req.body);
    await user.save();
    res.json(deal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all bookings for a user
router.get('/:id/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.id });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 