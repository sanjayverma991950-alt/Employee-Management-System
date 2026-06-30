import Leave from '../models/Leave.js';
import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';

// ==========================================
// LEAVE CONTROLLERS
// ==========================================

// @desc    Get all leave requests (filtered by user role)
// @route   GET /api/leaves
// @access  Private
export const getLeaves = async (req, res) => {
  try {
    let leaves;

    if (req.user.role === 'Admin') {
      // Admin sees everything
      leaves = await Leave.find({})
        .populate({
          path: 'employee',
          populate: { path: 'department', select: 'name code' }
        })
        .sort({ createdAt: -1 });
    } else {
      // Employee sees only their own
      if (!req.user.employeeProfile) {
        return res.status(400).json({ success: false, message: 'No employee profile associated with this account' });
      }
      leaves = await Leave.find({ employee: req.user.employeeProfile._id })
        .populate('employee', 'firstName lastName email designation')
        .sort({ createdAt: -1 });
    }

    res.json({ success: true, count: leaves.length, data: leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit a leave request
// @route   POST /api/leaves
// @access  Private
export const createLeaveRequest = async (req, res) => {
  const { type, startDate, endDate, reason } = req.body;

  try {
    if (!req.user.employeeProfile) {
      return res.status(400).json({ success: false, message: 'Only accounts with employee profiles can request leaves' });
    }

    if (!type || !startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const leave = await Leave.create({
      employee: req.user.employeeProfile._id,
      type,
      startDate,
      endDate,
      reason
    });

    const populated = await Leave.findById(leave._id).populate('employee', 'firstName lastName email');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve or Reject leave request
// @route   PUT /api/leaves/:id/status
// @access  Private/Admin
export const updateLeaveStatus = async (req, res) => {
  const { status, comments } = req.body;

  try {
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value. Must be Approved or Rejected' });
    }

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    leave.status = status;
    leave.comments = comments || '';
    
    await leave.save();

    const updated = await Leave.findById(leave._id).populate('employee', 'firstName lastName email designation');

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// ATTENDANCE CONTROLLERS
// ==========================================

// Helper to get today's date formatted as YYYY-MM-DD
const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// @desc    Get attendance logs
// @route   GET /api/leaves/attendance/logs
// @access  Private
export const getAttendanceLogs = async (req, res) => {
  try {
    let logs;
    if (req.user.role === 'Admin') {
      logs = await Attendance.find({})
        .populate('employee', 'firstName lastName email designation')
        .sort({ date: -1, createdAt: -1 });
    } else {
      if (!req.user.employeeProfile) {
        return res.status(400).json({ success: false, message: 'No employee profile' });
      }
      logs = await Attendance.find({ employee: req.user.employeeProfile._id })
        .sort({ date: -1 });
    }
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clock In for today
// @route   POST /api/leaves/attendance/clockin
// @access  Private
export const clockIn = async (req, res) => {
  try {
    if (!req.user.employeeProfile) {
      return res.status(400).json({ success: false, message: 'No employee profile associated' });
    }

    const todayStr = getTodayDateString();
    
    // Check if already clocked in today
    const existing = await Attendance.findOne({
      employee: req.user.employeeProfile._id,
      date: todayStr
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Already clocked in for today' });
    }

    // Determine status (Late if clocking in after 10:00 AM)
    const now = new Date();
    const hours = now.getHours();
    let status = 'Present';
    if (hours >= 10) {
      status = 'Late';
    }

    const attendance = await Attendance.create({
      employee: req.user.employeeProfile._id,
      date: todayStr,
      status,
      clockIn: now
    });

    res.status(201).json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clock Out for today
// @route   POST /api/leaves/attendance/clockout
// @access  Private
export const clockOut = async (req, res) => {
  try {
    if (!req.user.employeeProfile) {
      return res.status(400).json({ success: false, message: 'No employee profile associated' });
    }

    const todayStr = getTodayDateString();
    
    // Find today's attendance record
    const attendance = await Attendance.findOne({
      employee: req.user.employeeProfile._id,
      date: todayStr
    });

    if (!attendance) {
      return res.status(400).json({ success: false, message: 'You have not clocked in yet today' });
    }

    if (attendance.clockOut) {
      return res.status(400).json({ success: false, message: 'Already clocked out for today' });
    }

    attendance.clockOut = new Date();
    await attendance.save();

    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
