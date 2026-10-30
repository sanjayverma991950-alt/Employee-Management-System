import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  LogIn, 
  KeyRound, 
  Mail, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ArrowLeft, 
  UserPlus, 
  User, 
  Building2, 
  Briefcase, 
  ShieldCheck 
} from 'lucide-react';

const Login = ({ initialMode = 'login' }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'forgot'

  // Sync mode if initialMode prop changes (e.g. navigation between /login and /register)
  useEffect(() => {
    setMode(initialMode);
    setError('');
    setSuccess('');
  }, [initialMode]);

  // Common Feedback State
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Sign In State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Registration State
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState('Employee'); // 'Employee' | 'Admin'
  const [regDepartment, setRegDepartment] = useState('');
  const [regDesignation, setRegDesignation] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [departments, setDepartments] = useState([]);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fetch departments for registration dropdown
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await api.get('/auth/departments');
        if (res.success && Array.isArray(res.data)) {
          setDepartments(res.data);
          if (res.data.length > 0) {
            setRegDepartment(res.data[0]._id);
          }
        }
      } catch (err) {
        // Soft fail if departments API is unreachable
        console.warn('Could not load departments for registration:', err.message);
      }
    };
    fetchDepts();
  }, []);

  // Handle Sign In submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const res = await login(email, password);
      if (!res.success) {
        setError(res.message || 'Invalid email or password');
      }
    } catch (err) {
      setError('Connection to server failed. Ensure MongoDB & Backend are running.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Registration submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regFirstName || !regLastName || !regEmail || !regPassword || !regConfirmPassword) {
      setError('Please fill in all required fields');
      return;
    }
    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const payload = {
        firstName: regFirstName,
        lastName: regLastName,
        name: `${regFirstName} ${regLastName}`.trim(),
        email: regEmail,
        password: regPassword,
        role: regRole,
        department: regDepartment || (departments.length > 0 ? departments[0]._id : undefined),
        designation: regDesignation || (regRole === 'Admin' ? 'Administrator' : 'Software Engineer')
      };

      const res = await register(payload);
      if (!res.success) {
        setError(res.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Forgot Password submission
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const res = await api.post('/auth/forgot-password', {
        email: forgotEmail,
        newPassword
      });
      if (res.success) {
        setSuccess(res.message || 'Password reset successfully!');
        setEmail(forgotEmail);
        setPassword('');
        setTimeout(() => {
          setMode('login');
          setSuccess('');
        }, 2200);
      } else {
        setError(res.message || 'Failed to reset password');
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      background: 'radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.1) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(16, 185, 129, 0.08) 0%, transparent 40%), var(--bg-primary)',
      transition: 'background var(--transition-normal)'
    }}>
      <div className="glass" style={{
        width: '100%',
        maxWidth: mode === 'register' ? '500px' : '440px',
        padding: '2.5rem',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        transition: 'all 0.3s ease'
      }}>

        {/* Success Alert */}
        {success && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#10b981',
            fontSize: '0.8rem',
            fontWeight: 600,
            marginBottom: '1.5rem'
          }}>
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: 'var(--danger)',
            fontSize: '0.8rem',
            fontWeight: 600,
            marginBottom: '1.5rem'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* ================= REGISTER VIEW ================= */}
        {mode === 'register' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                margin: '0 auto 1rem'
              }}>
                <UserPlus size={24} />
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>Create Account</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Sign up for staff and employee portal access</p>
            </div>

            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* First & Last Name */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">First Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{
                      position: 'absolute',
                      left: '0.85rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)'
                    }} />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Jane"
                      value={regFirstName}
                      onChange={(e) => setRegFirstName(e.target.value)}
                      style={{ paddingLeft: '2.5rem' }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Doe"
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Corporate Email */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Corporate Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{
                    position: 'absolute',
                    left: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }} />
                  <input
                    type="email"
                    className="form-control"
                    placeholder="jane.doe@company.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Account Role</label>
                  <select
                    className="form-control"
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                  >
                    <option value="Employee">Employee</option>
                    <option value="Admin">Administrator</option>
                  </select>
                </div>

                {regRole === 'Employee' ? (
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Department</label>
                    <select
                      className="form-control"
                      value={regDepartment}
                      onChange={(e) => setRegDepartment(e.target.value)}
                    >
                      {departments.map((dept) => (
                        <option key={dept._id} value={dept._id}>
                          {dept.name}
                        </option>
                      ))}
                      {departments.length === 0 && <option value="">Engineering</option>}
                    </select>
                  </div>
                ) : (
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Security Clearance</label>
                    <input
                      type="text"
                      className="form-control"
                      value="Full Admin Rights"
                      disabled
                      style={{ opacity: 0.7 }}
                    />
                  </div>
                )}
              </div>

              {/* Designation (if Employee) */}
              {regRole === 'Employee' && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Designation / Job Title</label>
                  <div style={{ position: 'relative' }}>
                    <Briefcase size={16} style={{
                      position: 'absolute',
                      left: '0.85rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)'
                    }} />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Software Engineer, Analyst"
                      value={regDesignation}
                      onChange={(e) => setRegDesignation(e.target.value)}
                      style={{ paddingLeft: '2.5rem' }}
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={16} style={{
                    position: 'absolute',
                    left: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }} />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Minimum 6 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem' }}
                    required
                  />
                  <button
                    type="button"
                    className="btn-icon"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      padding: '0.25rem'
                    }}
                  >
                    {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={16} style={{
                    position: 'absolute',
                    left: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }} />
                  <input
                    type={showRegConfirmPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Re-enter password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem' }}
                    required
                  />
                  <button
                    type="button"
                    className="btn-icon"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      padding: '0.25rem'
                    }}
                  >
                    {showRegConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}
                disabled={submitting}
              >
                <UserPlus size={16} />
                <span>{submitting ? 'Creating Account...' : 'Register Account'}</span>
              </button>

              <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError('');
                      setSuccess('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Sign In
                  </button>
                </span>
              </div>
            </form>
          </div>
        )}

        {/* ================= FORGOT PASSWORD VIEW ================= */}
        {mode === 'forgot' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                margin: '0 auto 1rem'
              }}>
                <KeyRound size={22} />
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>Forgot Password</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Reset your account password with your registered email</p>
            </div>

            <form onSubmit={handleForgotPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Registered Corporate Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }} />
                  <input
                    type="email"
                    className="form-control"
                    placeholder="you@company.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    style={{ paddingLeft: '2.75rem' }}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">New Password</label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={16} style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }} />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Minimum 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                    required
                  />
                  <button
                    type="button"
                    className="btn-icon"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      padding: '0.25rem'
                    }}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={16} style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                    required
                  />
                  <button
                    type="button"
                    className="btn-icon"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      padding: '0.25rem'
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}
                disabled={submitting}
              >
                <span>{submitting ? 'Resetting Password...' : 'Reset Password'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                  setSuccess('');
                }}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <ArrowLeft size={16} />
                <span>Back to Sign In</span>
              </button>
            </form>
          </div>
        )}

        {/* ================= SIGN IN VIEW ================= */}
        {mode === 'login' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>Welcome</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Enter credentials to access the staff portal</p>
            </div>

            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Corporate Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }} />
                  <input
                    type="email"
                    className="form-control"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ paddingLeft: '2.75rem' }}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError('');
                      setSuccess('');
                      setForgotEmail(email || '');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={16} style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                    required
                  />
                  <button
                    type="button"
                    className="btn-icon"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      padding: '0.25rem'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}
                disabled={submitting}
              >
                <LogIn size={16} />
                <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
              </button>

              {/* Register link */}
              <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setError('');
                      setSuccess('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Register here
                  </button>
                </span>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default Login;
