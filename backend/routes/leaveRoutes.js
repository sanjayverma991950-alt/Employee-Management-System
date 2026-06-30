import express from 'express';
import {
  getLeaves,
  createLeaveRequest,
  updateLeaveStatus,
  getAttendanceLogs,
  clockIn,
  clockOut
} from '../controllers/leaveController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Attendance routes (must be register before dynamic /:id parameter routes)
router.route('/attendance/logs').get(protect, getAttendanceLogs);
router.route('/attendance/clockin').post(protect, clockIn);
router.route('/attendance/clockout').post(protect, clockOut);

// Leave routes
router.route('/')
  .get(protect, getLeaves)
  .post(protect, createLeaveRequest);

router.route('/:id/status')
  .put(protect, adminOnly, updateLeaveStatus);

export default router;
