import Employee from '../models/Employee.js';
import User from '../models/User.js';
import Department from '../models/Department.js';

// @desc    Get all employees (with search, filter, and population)
// @route   GET /api/employees
// @access  Private
export const getEmployees = async (req, res) => {
  try {
    const { search, department, status } = req.query;
    let query = {};

    // Search by first/last name, email, or designation
    if (search && search.trim() !== '') {
      const cleanSearch = search.trim();
      query.$or = [
        { firstName: { $regex: cleanSearch, $options: 'i' } },
        { lastName: { $regex: cleanSearch, $options: 'i' } },
        { email: { $regex: cleanSearch, $options: 'i' } },
        { designation: { $regex: cleanSearch, $options: 'i' } }
      ];
    }

    // Filter by department
    if (department && department !== 'all' && department.trim() !== '') {
      query.department = department;
    }

    // Filter by status
    if (status && status !== 'all' && status.trim() !== '') {
      query.status = status;
    }

    const employees = await Employee.find(query)
      .populate('department', 'name code')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: employees.length, data: employees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single employee detail
// @route   GET /api/employees/:id
// @access  Private
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate('department', 'name code');

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new employee profile (and their User login credentials)
// @route   POST /api/employees
// @access  Private/Admin
export const createEmployee = async (req, res) => {
  const { firstName, lastName, email, phone, designation, department, salary, status } = req.body;

  try {
    const cleanEmail = email?.toLowerCase()?.trim();

    if (!cleanEmail) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Check if email already registered
    const employeeExists = await Employee.findOne({ email: cleanEmail });
    if (employeeExists) {
      return res.status(400).json({ success: false, message: 'Employee with this email already exists' });
    }

    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User account with this email already exists' });
    }

    // Verify department exists
    const dept = await Department.findById(department);
    if (!dept) {
      return res.status(400).json({ success: false, message: 'Selected department not found' });
    }

    // 1. Create the associated User Login
    const defaultPassword = 'employee123'; // Default password for new employee
    const newUser = await User.create({
      email: cleanEmail,
      password: defaultPassword,
      role: 'Employee'
    });

    // 2. Create the Employee Profile
    const employee = await Employee.create({
      user: newUser._id,
      firstName: firstName?.trim(),
      lastName: lastName?.trim(),
      email: cleanEmail,
      phone: phone?.trim() || '',
      designation: designation?.trim(),
      department,
      salary: Number(salary) || 0,
      status: status || 'Active',
      joiningDate: new Date()
    });

    // 3. Link profile back to the User
    newUser.employeeProfile = employee._id;
    await newUser.save();

    const populatedEmployee = await Employee.findById(employee._id).populate('department', 'name code');

    res.status(201).json({
      success: true,
      message: 'Employee created and user login generated successfully',
      data: populatedEmployee,
      loginCredentials: {
        email: cleanEmail,
        password: defaultPassword
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update employee profile
// @route   PUT /api/employees/:id
// @access  Private/Admin
export const updateEmployee = async (req, res) => {
  const { firstName, lastName, email, phone, designation, department, salary, status } = req.body;

  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const cleanEmail = email?.toLowerCase()?.trim();

    // Handle email update in user credentials if changed
    if (cleanEmail && cleanEmail !== employee.email) {
      const emailExists = await Employee.findOne({ email: cleanEmail, _id: { $ne: employee._id } });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email is already in use by another employee' });
      }

      // Update user document
      if (employee.user) {
        await User.findByIdAndUpdate(employee.user, { email: cleanEmail });
      }
      employee.email = cleanEmail;
    }

    // Verify new department if changed
    if (department && department.toString() !== employee.department.toString()) {
      const deptExists = await Department.findById(department);
      if (!deptExists) {
        return res.status(400).json({ success: false, message: 'New department not found' });
      }
      employee.department = department;
    }

    if (firstName !== undefined) employee.firstName = firstName.trim();
    if (lastName !== undefined) employee.lastName = lastName.trim();
    if (phone !== undefined) employee.phone = phone.trim();
    if (designation !== undefined) employee.designation = designation.trim();
    if (salary !== undefined) employee.salary = Number(salary) || 0;
    if (status !== undefined) employee.status = status;

    const updatedEmployee = await employee.save();
    const populated = await Employee.findById(updatedEmployee._id).populate('department', 'name code');

    res.json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete employee profile and associated User login
// @route   DELETE /api/employees/:id
// @access  Private/Admin
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Delete associated login user first if exists
    if (employee.user) {
      await User.findByIdAndDelete(employee.user);
    }

    // Delete employee profile
    await Employee.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Employee and user credentials deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
