import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Department from '../models/Department.js';

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
  let { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    email = email.toLowerCase().trim();

    // Check for user email
    const user = await User.findOne({ email }).populate('employeeProfile');

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        _id: user._id,
        name: user.name || (user.role === 'Admin' ? 'Admin' : ''),
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

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  let { name, firstName, lastName, email, password, role, department, designation, phone } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    email = email.toLowerCase().trim();

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const employeeExists = await Employee.findOne({ email });
    if (employeeExists) {
      return res.status(400).json({ success: false, message: 'An employee with this email already exists' });
    }

    // Determine names
    let fName = firstName?.trim();
    let lName = lastName?.trim();
    if (!fName && name) {
      const parts = name.trim().split(' ');
      fName = parts[0];
      lName = parts.slice(1).join(' ') || 'User';
    }
    if (!fName) fName = 'New';
    if (!lName) lName = 'Member';
    const fullName = `${fName} ${lName}`.trim();

    const assignedRole = role === 'Admin' ? 'Admin' : 'Employee';

    // Create User record
    const user = await User.create({
      name: assignedRole === 'Admin' ? (name?.trim() || 'Admin') : fullName,
      email,
      password,
      role: assignedRole
    });

    // If Employee, create and link an Employee profile
    if (assignedRole === 'Employee') {
      let deptId = department;
      if (!deptId) {
        const defaultDept = await Department.findOne({});
        deptId = defaultDept ? defaultDept._id : null;
      }

      if (deptId) {
        const employeeProfile = await Employee.create({
          user: user._id,
          firstName: fName,
          lastName: lName,
          email,
          phone: phone?.trim() || '',
          designation: designation?.trim() || 'Staff Member',
          department: deptId,
          salary: 500000,
          status: 'Active',
          joiningDate: new Date()
        });

        user.employeeProfile = employeeProfile._id;
        await user.save();
      }
    }

    const populatedUser = await User.findById(user._id).populate('employeeProfile');

    res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      employeeProfile: populatedUser.employeeProfile,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get departments for registration dropdown
// @route   GET /api/auth/departments
// @access  Public
export const getRegistrationDepartments = async (req, res) => {
  try {
    const departments = await Department.find({}).select('name code');
    res.json({ success: true, data: departments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset password (Forgot Password)
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  let { email, newPassword } = req.body;

  try {
    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide registered email and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    email = email.toLowerCase().trim();

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No registered user found with this email' });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.'
    });
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
