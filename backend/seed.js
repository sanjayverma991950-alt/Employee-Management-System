import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Employee from './models/Employee.js';
import Department from './models/Department.js';
import Leave from './models/Leave.js';
import Attendance from './models/Attendance.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ems';
    console.log(`Connecting to database for seeding: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    // 1. Clear Database
    console.log('Clearing database...');
    await User.deleteMany({});
    await Employee.deleteMany({});
    await Department.deleteMany({});
    await Leave.deleteMany({});
    await Attendance.deleteMany({});

    console.log('Database cleared.');

    // 2. Create Departments
    console.log('Seeding departments...');
    const depts = await Department.insertMany([
      {
        name: 'Engineering',
        code: 'ENG',
        description: 'Product development and technical infrastructure.',
        managerName: 'Sarah Jenkins',
        budget: 450000
      },
      {
        name: 'Human Resources',
        code: 'HR',
        description: 'Recruitment, operations, and culture.',
        managerName: 'David Vance',
        budget: 120000
      },
      {
        name: 'Marketing',
        code: 'MKT',
        description: 'Brand growth, advertisements, and communication.',
        managerName: 'Elena Rostova',
        budget: 200000
      }
    ]);
    console.log(`Seeded ${depts.length} departments.`);

    // 3. Create Admin Login
    console.log('Seeding admin account...');
    const adminUser = await User.create({
      email: 'admin@ems.com',
      password: 'admin123',
      role: 'Admin'
    });
    console.log('Admin account seeded (admin@ems.com / admin123).');

    // 4. Create Employee Login (will link to profile)
    console.log('Seeding default employee account...');
    const empUser = await User.create({
      email: 'employee@ems.com',
      password: 'employee123',
      role: 'Employee'
    });

    // 5. Create Employee Profile for default user
    const defaultEmployee = await Employee.create({
      user: empUser._id,
      firstName: 'John',
      lastName: 'Doe',
      email: 'employee@ems.com',
      phone: '+1 555-0199',
      designation: 'Software Engineer',
      department: depts[0]._id, // Engineering
      salary: 85000,
      status: 'Active',
      joiningDate: new Date('2025-01-15')
    });

    // Link employee profile back to User
    empUser.employeeProfile = defaultEmployee._id;
    await empUser.save();
    console.log('Default Employee seeded (employee@ems.com / employee123).');

    // 6. Create Additional Mock Employees
    console.log('Seeding mock employees...');
    const mockEmployees = await Employee.insertMany([
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@ems.com',
        phone: '+1 555-0144',
        designation: 'Senior HR Specialist',
        department: depts[1]._id, // HR
        salary: 68000,
        status: 'Active',
        joiningDate: new Date('2024-03-10')
      },
      {
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.b@ems.com',
        phone: '+1 555-0187',
        designation: 'QA Lead',
        department: depts[0]._id, // Engineering
        salary: 78000,
        status: 'Active',
        joiningDate: new Date('2024-08-22')
      },
      {
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.d@ems.com',
        phone: '+1 555-0123',
        designation: 'Creative Designer',
        department: depts[2]._id, // Marketing
        salary: 58000,
        status: 'Active',
        joiningDate: new Date('2025-02-01')
      },
      {
        firstName: 'David',
        lastName: 'Miller',
        email: 'david.m@ems.com',
        phone: '+1 555-0155',
        designation: 'Backend Developer',
        department: depts[0]._id, // Engineering
        salary: 80000,
        status: 'Active',
        joiningDate: new Date('2025-05-10')
      }
    ]);
    console.log(`Seeded ${mockEmployees.length} additional employees.`);

    // 7. Seed Leaves
    console.log('Seeding mock leaves...');
    await Leave.insertMany([
      {
        employee: defaultEmployee._id, // John Doe
        type: 'Sick',
        startDate: new Date('2026-06-10'),
        endDate: new Date('2026-06-11'),
        reason: 'Severe flu and high temperature.',
        status: 'Approved',
        comments: 'Get well soon.'
      },
      {
        employee: defaultEmployee._id, // John Doe
        type: 'Annual',
        startDate: new Date('2026-07-15'),
        endDate: new Date('2026-07-22'),
        reason: 'Family vacation.',
        status: 'Pending',
        comments: ''
      },
      {
        employee: mockEmployees[0]._id, // Jane Smith
        type: 'Casual',
        startDate: new Date('2026-05-02'),
        endDate: new Date('2026-05-03'),
        reason: 'Personal urgent matter.',
        status: 'Approved',
        comments: 'Approved by manager.'
      },
      {
        employee: mockEmployees[1]._id, // Michael Brown
        type: 'Annual',
        startDate: new Date('2026-04-10'),
        endDate: new Date('2026-04-20'),
        reason: 'Spring trip.',
        status: 'Approved',
        comments: 'Enjoy your holidays.'
      },
      {
        employee: mockEmployees[2]._id, // Emily Davis
        type: 'Unpaid',
        startDate: new Date('2026-06-28'),
        endDate: new Date('2026-06-30'),
        reason: 'Moving to a new apartment.',
        status: 'Pending',
        comments: ''
      }
    ]);
    console.log('Seeded leaves.');

    // 8. Seed Attendance logs for last few days
    console.log('Seeding mock attendance logs...');
    const allEmployees = [defaultEmployee, ...mockEmployees];
    
    // Generate dates: 3 days back up to today
    const dates = [];
    const today = new Date();
    for (let i = 3; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);
    }

    const attendanceRecords = [];
    dates.forEach((dateStr) => {
      allEmployees.forEach((emp, index) => {
        // Randomize attendance status
        // John Doe might be late, Michael Brown is absent on one day, others present
        let status = 'Present';
        let clockInTime = new Date(`${dateStr}T09:00:00`);
        let clockOutTime = new Date(`${dateStr}T17:00:00`);

        const roll = Math.random();
        if (roll < 0.1) {
          status = 'Absent';
          clockInTime = null;
          clockOutTime = null;
        } else if (roll < 0.3) {
          status = 'Late';
          clockInTime = new Date(`${dateStr}T10:15:00`);
        }

        if (status !== 'Absent') {
          attendanceRecords.push({
            employee: emp._id,
            date: dateStr,
            status,
            clockIn: clockInTime,
            clockOut: clockOutTime
          });
        }
      });
    });

    await Attendance.insertMany(attendanceRecords);
    console.log(`Seeded ${attendanceRecords.length} attendance records.`);

    console.log('Seeding process completed successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error(`Seeding failed: ${error.message}`);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedData();
