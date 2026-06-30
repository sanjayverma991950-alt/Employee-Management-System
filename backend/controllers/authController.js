import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper to generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_ems_key_12345', {
    expiresIn: '30d'
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check for user email
    const user = await User.findOne({ email }).populate('employeeProfile');

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        _id: user._id,
        email: user.email,
        role: user.role,
        employeeProfile: user.employeeProfile,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate({
      path: 'employeeProfile',
      populate: {
        path: 'department',
        select: 'name code'
      }
    });

    if (user) {
      res.json({
        success: true,
        data: user
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
