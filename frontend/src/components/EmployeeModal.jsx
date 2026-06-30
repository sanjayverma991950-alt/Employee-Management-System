import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { X, Save } from 'lucide-react';

const EmployeeModal = ({ isOpen, onClose, employee, onSave }) => {
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    designation: '',
    department: '',
    salary: '',
    status: 'Active'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch departments for dropdown select on mount
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await api.get('/departments');
        if (res.success) {
          setDepartments(res.data);
        }
      } catch (err) {
        console.error('Failed to load departments', err);
      }
    };
    if (isOpen) {
      fetchDepts();
    }
  }, [isOpen]);

  // Sync state if editing an employee
  useEffect(() => {
    if (employee) {
      setFormData({
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        email: employee.email || '',
        phone: employee.phone || '',
        designation: employee.designation || '',
        department: employee.department?._id || employee.department || '',
        salary: employee.salary || '',
        status: employee.status || 'Active'
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        designation: '',
        department: '',
        salary: '',
        status: 'Active'
      });
    }
    setError('');
  }, [employee, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.designation || !formData.department || !formData.salary) {
      setError('Please fill in all required fields');
      return;
    }
    setError('');
    setLoading(true);
    try {
      let res;
      if (employee?._id) {
        // Edit Employee API
        res = await api.put(`/employees/${employee._id}`, formData);
      } else {
        // Add Employee API (returns credentials too)
        res = await api.post('/employees', formData);
      }

      if (res.success) {
        onSave(res.data, res.loginCredentials);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Operation failed. Ensure details are valid.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content glass" style={{ maxWidth: '650px' }}>
        
        {/* Header */}
        <div className="modal-header">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            {employee ? 'Modify Employee Profile' : 'Register New Employee'}
          </h2>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: 'var(--danger)',
            fontSize: '0.8rem',
            fontWeight: 600,
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.25rem'
          }}>
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input
                type="text"
                name="firstName"
                className="form-control"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input
                type="text"
                name="lastName"
                className="form-control"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                name="phone"
                className="form-control"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Designation *</label>
              <input
                type="text"
                name="designation"
                className="form-control"
                placeholder="e.g. Lead Designer"
                value={formData.designation}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Department *</label>
              <select
                name="department"
                className="form-control"
                value={formData.department}
                onChange={handleChange}
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Annual Salary (USD) *</label>
              <input
                type="number"
                name="salary"
                className="form-control"
                value={formData.salary}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status *</label>
              <select
                name="status"
                className="form-control"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '1.25rem',
            marginTop: '1.5rem'
          }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save size={16} />
              <span>{loading ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default EmployeeModal;
