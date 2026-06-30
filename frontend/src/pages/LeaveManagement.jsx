import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  CalendarDays, 
  Plus, 
  Check, 
  X, 
  Info, 
  MessageSquare,
  Send,
  HelpCircle
} from 'lucide-react';

const LeaveManagement = () => {
  const { isAdmin, user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  // Employee: Request form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [requestData, setRequestData] = useState({
    type: 'Annual',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Admin: Review state
  const [reviewingLeave, setReviewingLeave] = useState(null);
  const [adminComments, setAdminComments] = useState('');
  const [reviewError, setReviewError] = useState('');

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await api.get('/leaves');
      if (res.success) {
        setLeaves(res.data);
      }
    } catch (err) {
      console.error('Failed to load leaves', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [user]);

  const handleRequestChange = (e) => {
    const { name, value } = e.target;
    setRequestData(prev => ({ ...prev, [name]: value }));
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!requestData.startDate || !requestData.endDate || !requestData.reason) {
      setSubmitError('Please fill in all fields');
      return;
    }
    setSubmitError('');
    setSubmitting(true);
    try {
      const res = await api.post('/leaves', requestData);
      if (res.success) {
        setIsFormOpen(false);
        setRequestData({
          type: 'Annual',
          startDate: '',
          endDate: '',
          reason: ''
        });
        fetchLeaves();
      }
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  const startReview = (leave) => {
    setReviewingLeave(leave);
    setAdminComments('');
    setReviewError('');
  };

  const submitReview = async (status) => {
    setReviewError('');
    try {
      const res = await api.put(`/leaves/${reviewingLeave._id}/status`, {
        status,
        comments: adminComments
      });
      if (res.success) {
        setReviewingLeave(null);
        fetchLeaves();
      }
    } catch (err) {
      setReviewError(err.message || 'Failed to update leave status');
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
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Leave Management</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {isAdmin ? 'Review and manage employee leave request workflows.' : 'Track your requested leaves and request time-off.'}
          </p>
        </div>
        {!isAdmin && (
          <button className="btn btn-primary" onClick={() => setIsFormOpen(true)}>
            <Plus size={16} />
            Request Leave
          </button>
        )}
      </div>

      {/* Main Content List */}
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
      ) : leaves.length === 0 ? (
        <div className="glass" style={{ textAlign: 'center', padding: '4rem 1rem', borderRadius: 'var(--radius-md)' }}>
          <CalendarDays size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
          <h4 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>No Leave Requests logged</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Submitted requests will appear in this workspace.</p>
        </div>
      ) : (
        <div className="table-wrapper glass">
          <table className="custom-table">
            <thead>
              <tr>
                {isAdmin && <th>Employee</th>}
                <th>Leave Type</th>
                <th>Dates Duration</th>
                <th>Days Count</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Feedback / Comments</th>
                {isAdmin && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => {
                const start = new Date(leave.startDate);
                const end = new Date(leave.endDate);
                const diffTime = Math.abs(end - start);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

                const badgeClass = `badge badge-${leave.status.toLowerCase()}`;

                return (
                  <tr key={leave._id}>
                    {isAdmin && (
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <strong style={{ fontSize: '0.85rem' }}>
                            {leave.employee ? `${leave.employee.firstName} ${leave.employee.lastName}` : 'System User'}
                          </strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {leave.employee?.department?.name || 'No Dept'}
                          </span>
                        </div>
                      </td>
                    )}
                    <td>
                      <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', textTransform: 'none' }}>
                        {leave.type}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>
                        {start.toLocaleDateString()} - {end.toLocaleDateString()}
                      </div>
                    </td>
                    <td><strong>{diffDays} {diffDays === 1 ? 'day' : 'days'}</strong></td>
                    <td style={{ maxWidth: '240px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {leave.reason}
                    </td>
                    <td>
                      <span className={badgeClass}>{leave.status}</span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: leave.comments ? 'normal' : 'italic' }}>
                      {leave.comments || 'No comments logged.'}
                    </td>
                    {isAdmin && (
                      <td style={{ textAlign: 'right' }}>
                        {leave.status === 'Pending' ? (
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                            onClick={() => startReview(leave)}
                          >
                            Review
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reviewed</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Employee Submit Request Modal */}
      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass" style={{ maxWidth: '500px' }}>
            
            <div className="modal-header">
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Request Leave / Time-off</h2>
              <button className="btn-icon" onClick={() => setIsFormOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {submitError && (
              <div style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: 'var(--danger)',
                fontSize: '0.8rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1rem'
              }}>
                {submitError}
              </div>
            )}

            <form onSubmit={handleRequestSubmit}>
              
              <div className="form-group">
                <label className="form-label">Leave Type *</label>
                <select
                  name="type"
                  className="form-control"
                  value={requestData.type}
                  onChange={handleRequestChange}
                  required
                >
                  <option value="Annual">Annual Leave</option>
                  <option value="Sick">Sick Leave</option>
                  <option value="Casual">Casual Leave</option>
                  <option value="Unpaid">Unpaid Leave</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Start Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    className="form-control"
                    value={requestData.startDate}
                    onChange={handleRequestChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date *</label>
                  <input
                    type="date"
                    name="endDate"
                    className="form-control"
                    value={requestData.endDate}
                    onChange={handleRequestChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Reason for Request *</label>
                <textarea
                  name="reason"
                  className="form-control"
                  rows="4"
                  placeholder="Describe your reasoning..."
                  value={requestData.reason}
                  onChange={handleRequestChange}
                  required
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
                <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  <Send size={14} />
                  <span>{submitting ? 'Submitting...' : 'Submit Request'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Admin Review Modal */}
      {reviewingLeave && (
        <div className="modal-overlay">
          <div className="modal-content glass" style={{ maxWidth: '500px' }}>
            
            <div className="modal-header">
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Review Leave Request</h2>
              <button className="btn-icon" onClick={() => setReviewingLeave(null)}>
                <X size={20} />
              </button>
            </div>

            {reviewError && (
              <div style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: 'var(--danger)',
                fontSize: '0.8rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1rem'
              }}>
                {reviewError}
              </div>
            )}

            {/* Leave Info */}
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-color)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              marginBottom: '1.25rem'
            }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Employee:</strong> {reviewingLeave.employee?.firstName} {reviewingLeave.employee?.lastName}
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Type:</strong> {reviewingLeave.type} Leave
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Dates:</strong> {new Date(reviewingLeave.startDate).toLocaleDateString()} to {new Date(reviewingLeave.endDate).toLocaleDateString()}
              </div>
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                <strong>Reason:</strong> <span style={{ color: 'var(--text-secondary)' }}>{reviewingLeave.reason}</span>
              </div>
            </div>

            {/* Form */}
            <div>
              <div className="form-group">
                <label className="form-label">Review Comments / Feedback</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Optional review message..."
                  value={adminComments}
                  onChange={(e) => setAdminComments(e.target.value)}
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
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setReviewingLeave(null)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={() => submitReview('Rejected')}
                >
                  <X size={14} />
                  Reject
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  style={{ backgroundColor: 'var(--secondary)' }}
                  onClick={() => submitReview('Approved')}
                >
                  <Check size={14} />
                  Approve
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default LeaveManagement;
