import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Employee reference is required']
  },
  date: {
    type: String, // format YYYY-MM-DD for easy querying per day
    required: [true, 'Date is required']
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late'],
    default: 'Present'
  },
  clockIn: {
    type: Date,
    default: null
  },
  clockOut: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index to ensure an employee has only one attendance record per day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
