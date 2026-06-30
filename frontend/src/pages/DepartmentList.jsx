import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Building2, 
  Plus, 
  Trash2, 
  Edit2, 
  DollarSign, 
  Users, 
  X,
  Save,
  CheckCircle
} from 'lucide-react';

const DepartmentList = () => {
  const { isAdmin } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  
  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    managerName: '',
    budget: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/departments');
      if (res.success) {
        setDepartments(res.data);
      }
    } catch (err) {
      console.error('Failed to load departments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreate = () => {
    setSelectedDept(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      managerName: '',
      budget: ''
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleEdit = (dept) => {
    setSelectedDept(dept);
    setFormData({
      name: dept.name || '',
      code: dept.code || '',
      description: dept.description || '',
      managerName: dept.managerName || '',
      budget: dept.budget || ''
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this department? Make sure no employees are assigned first.')) {
      try {
        const res = await api.delete(`/departments/${id}`);
        if (res.success) {
          fetchDepartments();
        }
      } catch (err) {
        alert(err.message || 'Failed to delete department. Ensure no employees are assigned.');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code || !formData.managerName) {
      setError('Please fill in Name, Code, and Manager fields');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      let res;
      if (selectedDept?._id) {
        res = await api.put(`/departments/${selectedDept._id}`, formData);
      } else {
        res = await api.post('/departments', formData);
      }

      if (res.success) {
        setIsModalOpen(false);
        fetchDepartments();
      }
    } catch (err) {
      setError(err.message || 'Operation failed. Ensure code/name is unique.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      
      {/* Page Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Corporate Departments</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>View budgets, managers, and structural headcounts.</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={handleCreate}>
            <Plus size={16} />
            Create Department
          </button>
        )}
      </div>

      {/* Grid List */}
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
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}>
          {departments.map((dept) => (
            <div key={dept._id} className="glass glass-hover" style={{
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative'
            }}>
              
              {/* Header card */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span className="badge badge-active" style={{ fontSize: '0.65rem' }}>
                    {dept.code}
                  </span>
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button className="btn-icon" onClick={() => handleEdit(dept)} style={{ padding: '0.25rem' }}>
                        <Edit2 size={13} />
                      </button>
                      <button className="btn-icon" onClick={() => handleDelete(dept._id)} style={{ padding: '0.25rem', color: 'var(--danger)' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  {dept.name}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', minHeight: '38px', lineHeight: 1.4 }}>
                  {dept.description || 'No description provided.'}
                </p>
              </div>

              {/* Footer info card */}
              <div style={{
                borderTop: '1px solid var(--border-color)',
                paddingTop: '1rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                fontSize: '0.8rem'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Department Head</span>
                  <strong style={{ marginTop: '0.15rem' }}>{dept.managerName}</strong>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Total Staff</span>
                  <strong style={{ marginTop: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Users size={14} style={{ color: 'var(--primary)' }} />
                    {dept.employeeCount || 0} Members
                  </strong>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gridColumn: 'span 2', marginTop: '0.25rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Annual Operating Budget</span>
                  <strong style={{ marginTop: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.15rem', color: 'var(--secondary)', fontSize: '0.95rem' }}>
                    <DollarSign size={14} />
                    {dept.budget ? dept.budget.toLocaleString() : '0'} USD
                  </strong>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass" style={{ maxWidth: '500px' }}>
            
            <div className="modal-header">
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                {selectedDept ? 'Modify Department Details' : 'Create New Department'}
              </h2>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

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

            <form onSubmit={handleSubmit}>
              
              <div className="form-group">
                <label className="form-label">Department Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="e.g. Quality Assurance"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department Code (Uppercase) *</label>
                <input
                  type="text"
                  name="code"
                  className="form-control"
                  placeholder="e.g. QA"
                  value={formData.code}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department Head / Manager *</label>
                <input
                  type="text"
                  name="managerName"
                  className="form-control"
                  placeholder="e.g. Sarah Jenkins"
                  value={formData.managerName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Annual Budget (USD)</label>
                <input
                  type="number"
                  name="budget"
                  className="form-control"
                  placeholder="e.g. 150000"
                  value={formData.budget}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Short Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  rows="3"
                  placeholder="Enter department scope and goals..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '1.25rem',
                marginTop: '1.5rem'
              }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  <Save size={16} />
                  <span>{submitting ? 'Saving...' : 'Save Department'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default DepartmentList;
