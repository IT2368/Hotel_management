import express from 'express';
import {
  getGuestById
} from '../controllers/guestController.js';
import { getPublicStaffUpdates } from '../controllers/staff/taskController.js';

const router = express.Router();

// Guest profile routes
router.get('/:id', getGuestById);

// Public staff updates for guests
router.get('/staff-updates/public', getPublicStaffUpdates);

export default router;
