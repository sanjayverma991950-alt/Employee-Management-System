import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, KeyRound, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
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

  // Helper to pre-fill login credentials for demo purposes
  const preFill = (role) => {
    if (role === 'admin') {
      setEmail('admin@ems.com');
      setPassword('admin123');
    } else {
      setEmail('employee@ems.com');
      setPassword('employee123');
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
        maxWidth: '440px',
        padding: '2.5rem',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Logo and Greeting */}
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
            fontWeight: 800,
            fontSize: '1.5rem',
            margin: '0 auto 1rem'
          }}>
            E
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Enter credentials to access the staff portal</p>
        </div>

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

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
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
            <label className="form-label">Password</label>
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
        </form>

        {/* Demo Fast Login Helpers */}
        <div style={{
          marginTop: '2rem',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1.5rem',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Quick Demo Login
          </span>
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            justifyContent: 'center',
            marginTop: '0.75rem'
          }}>
            <button
              onClick={() => preFill('admin')}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem', flex: 1 }}
            >
              Admin Acc
            </button>
            <button
              onClick={() => preFill('employee')}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem', flex: 1 }}
            >
              Employee Acc
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
