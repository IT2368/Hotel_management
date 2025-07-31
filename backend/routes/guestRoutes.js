import express from 'express';
import {
  getGuestById
} from '../controllers/guestController.js';

const router = express.Router();

// Guest profile routes
router.get('/:id', getGuestById);

export default router;
