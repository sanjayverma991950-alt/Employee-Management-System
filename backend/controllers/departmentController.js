import Department from '../models/Department.js';
import Employee from '../models/Employee.js';

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({});
    
    // Enrich with employee count for each department
    const enrichedDepartments = await Promise.all(departments.map(async (dept) => {
      const employeeCount = await Employee.countDocuments({ department: dept._id });
      return {
        ...dept.toObject(),
        employeeCount
      };
    }));

    res.json({ success: true, data: enrichedDepartments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a department
// @route   POST /api/departments
// @access  Private/Admin
export const createDepartment = async (req, res) => {
  const { name, code, description, managerName, budget } = req.body;

  try {
    const departmentExists = await Department.findOne({ $or: [{ name }, { code }] });

    if (departmentExists) {
      return res.status(400).json({ success: false, message: 'Department name or code already exists' });
    }

    const department = await Department.create({
      name,
      code,
      description,
      managerName,
      budget: budget || 0
    });

    res.status(201).json({ success: true, data: department });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a department
// @route   PUT /api/departments/:id
// @access  Private/Admin
export const updateDepartment = async (req, res) => {
  const { name, code, description, managerName, budget } = req.body;

  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    // Check duplicate code/name if altered
    if (name && name !== department.name) {
      const nameExists = await Department.findOne({ name });
      if (nameExists) return res.status(400).json({ success: false, message: 'Department name already exists' });
      department.name = name;
    }
    if (code && code !== department.code) {
      const codeExists = await Department.findOne({ code });
      if (codeExists) return res.status(400).json({ success: false, message: 'Department code already exists' });
      department.code = code;
    }

    department.description = description !== undefined ? description : department.description;
    department.managerName = managerName !== undefined ? managerName : department.managerName;
    department.budget = budget !== undefined ? budget : department.budget;

    const updatedDept = await department.save();
    res.json({ success: true, data: updatedDept });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a department
// @route   DELETE /api/departments/:id
// @access  Private/Admin
export const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    // Prevent deletion if employees belong to this department
    const employeeCount = await Employee.countDocuments({ department: req.params.id });
    if (employeeCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department. There are ${employeeCount} employees assigned to it.`
      });
    }

    await Department.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Department removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
