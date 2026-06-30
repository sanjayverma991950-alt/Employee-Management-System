import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Department name is required'],
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Department code is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  description: {
    type: String,
    default: ''
  },
  managerName: {
    type: String,
    default: 'TBD'
  },
  budget: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Department = mongoose.model('Department', departmentSchema);
export default Department;
