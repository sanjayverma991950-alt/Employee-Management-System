import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Employee reference is required']
  },
  type: {
    type: String,
    enum: ['Annual', 'Sick', 'Casual', 'Unpaid'],
    required: [true, 'Leave type is required']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  reason: {
    type: String,
    required: [true, 'Reason for leave is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  comments: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const Leave = mongoose.model('Leave', leaveSchema);
export default Leave;
