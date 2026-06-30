import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import EmployeeModal from '../components/EmployeeModal';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Filter, 
  Info,
  ShieldCheck
} from 'lucide-react';

const EmployeeList = () => {
  const { isAdmin } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modal control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  // Credential popups
  const [newCredentials, setNewCredentials] = useState(null);

  const fetchEmployees = async () => {
    try {
      const res = await api.get(`/employees?search=${search}&department=${selectedDept}&status=${selectedStatus}`);
      if (res.success) {
        setEmployees(res.data);
      }
    } catch (err) {
      console.error('Failed to load employees', err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      if (res.success) {
        setDepartments(res.data);
      }
    } catch (err) {
      console.error('Failed to load departments', err);
    }
  };

  useEffect(() => {
    const initLoad = async () => {
      setLoading(true);
      await Promise.all([fetchEmployees(), fetchDepartments()]);
      setLoading(false);
    };
    initLoad();
  }, [search, selectedDept, selectedStatus]);

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedEmployee(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this employee and delete their user credentials?')) {
      try {
        const res = await api.delete(`/employees/${id}`);
        if (res.success) {
          fetchEmployees();
        }
      } catch (err) {
        alert(err.message || 'Failed to delete employee');
      }
    }
  };

  const handleSave = (savedEmployee, credentials) => {
    fetchEmployees();
    if (credentials) {
      // Show credentials notification modal
      setNewCredentials(credentials);
    }
  };

  return (
    <div className="page-container">
      
      {/* Title block */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Employee Directory</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Search, filter, and manage staff records.</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={handleCreate}>
            <Plus size={16} />
            Add Employee
          </button>
        )}
      </div>

      {/* New Credentials Notification */}
      {newCredentials && (
        <div className="glass" style={{
          padding: '1.5rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '2rem',
          border: '1px solid var(--secondary)',
          background: 'rgba(16, 185, 129, 0.05)'
        }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            <ShieldCheck size={18} />
            <span>Employee Access Credentials Generated</span>
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            A user account has been successfully generated. Log in with the following credentials:
          </p>
          <div style={{
            display: 'inline-flex',
            gap: '1.5rem',
            padding: '0.75rem 1.25rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            fontSize: '0.85rem',
            fontFamily: 'monospace'
          }}>
            <span><strong>Email:</strong> {newCredentials.email}</span>
            <span><strong>Password:</strong> {newCredentials.password}</span>
          </div>
          <button 
            className="btn btn-secondary" 
            style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', marginLeft: '1.5rem' }}
            onClick={() => setNewCredentials(null)}
          >
            Acknowledge
          </button>
        </div>
      )}

      {/* Filters Deck */}
      <div className="glass" style={{
        padding: '1.25rem',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={16} style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)'
          }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, email, role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        {/* Dept filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '180px' }}>
          <Filter size={14} style={{ color: 'var(--text-muted)' }} />
          <select 
            className="form-control"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <option value="all">All Departments</option>
            {departments.map(d => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <div style={{ minWidth: '140px' }}>
          <select 
            className="form-control"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

      </div>

      {/* Directory Table */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
          <div style={{
            border: '3px solid var(--border-color)',
            borderTop: '3px solid var(--primary)',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      ) : employees.length === 0 ? (
        <div className="glass" style={{ textAlign: 'center', padding: '4rem 1rem', borderRadius: 'var(--radius-md)' }}>
          <Info size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
          <h4 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>No Employees Found</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Try adjusting your search criteria or add new profiles.</p>
        </div>
      ) : (
        <div className="table-wrapper glass">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Designation</th>
                <th>Department</th>
                <th>Joined</th>
                <th>Salary</th>
                <th>Status</th>
                {isAdmin && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => {
                const badgeClass = `badge badge-${emp.status.toLowerCase()}`;
                
                return (
                  <tr key={emp._id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <strong style={{ fontSize: '0.9rem' }}>{emp.firstName} {emp.lastName}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.email}</span>
                      </div>
                    </td>
                    <td>{emp.designation}</td>
                    <td>
                      <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', textTransform: 'none' }}>
                        {emp.department ? emp.department.name : 'Unassigned'}
                      </span>
                    </td>
                    <td>{new Date(emp.joiningDate).toLocaleDateString()}</td>
                    <td>
                      {isAdmin ? (
                        `$${emp.salary.toLocaleString()}`
                      ) : (
                        <span style={{ 
                          filter: 'blur(3.5px)', 
                          userSelect: 'none', 
                          opacity: 0.6,
                          fontSize: '0.8rem',
                          fontWeight: 700
                        }} title="Confidential record">
                          $85,000
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={badgeClass}>{emp.status}</span>
                    </td>
                    {isAdmin && (
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem' }}>
                          <button className="btn-icon" onClick={() => handleEdit(emp)} title="Edit profile">
                            <Edit2 size={15} />
                          </button>
                          <button className="btn-icon" onClick={() => handleDelete(emp._id)} title="Delete record" style={{ color: 'var(--danger)' }}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employee={selectedEmployee}
        onSave={handleSave}
      />

    </div>
  );
};

export default EmployeeList;
