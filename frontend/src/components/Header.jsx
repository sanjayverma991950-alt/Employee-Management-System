import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Sun, 
  Moon, 
  User, 
  Clock, 
  Play, 
  Square,
  Menu
} from 'lucide-react';

const Header = ({ onMenuToggle }) => {
  const { user, theme, toggleTheme, isAdmin } = useAuth();
  const [clockStatus, setClockStatus] = useState({
    clockedIn: false,
    clockedOut: false,
    clockInTime: null,
    clockOutTime: null,
    loading: false
  });

  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good Morning';
    if (hrs < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Helper to format date
  const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchTodayAttendance = async () => {
    if (isAdmin) return; // Admins don't clock in
    try {
      const res = await api.get('/leaves/attendance/logs');
      if (res.success && res.data) {
        const todayStr = getTodayDateString();
        const todayLog = res.data.find(log => log.date === todayStr);
        if (todayLog) {
          setClockStatus({
            clockedIn: true,
            clockedOut: !!todayLog.clockOut,
            clockInTime: todayLog.clockIn ? new Date(todayLog.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
            clockOutTime: todayLog.clockOut ? new Date(todayLog.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
            loading: false
          });
        }
      }
    } catch (error) {
      console.error('Failed to load attendance logs for header', error);
    }
  };

  useEffect(() => {
    fetchTodayAttendance();
  }, [user]);

  const handleClockIn = async () => {
    setClockStatus(prev => ({ ...prev, loading: true }));
    try {
      const res = await api.post('/leaves/attendance/clockin');
      if (res.success) {
        await fetchTodayAttendance();
      }
    } catch (error) {
      alert(error.message || 'Failed to Clock In');
      setClockStatus(prev => ({ ...prev, loading: false }));
    }
  };

  const handleClockOut = async () => {
    setClockStatus(prev => ({ ...prev, loading: true }));
    try {
      const res = await api.post('/leaves/attendance/clockout');
      if (res.success) {
        await fetchTodayAttendance();
      }
    } catch (error) {
      alert(error.message || 'Failed to Clock Out');
      setClockStatus(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <header className="glass header-bar">
      <div className="header-left">
        {/* Hamburger - visible only on mobile */}
        <button
          className="btn-icon hamburger-btn"
          onClick={onMenuToggle}
          title="Toggle navigation"
        >
          <Menu size={22} />
        </button>

        {/* Greeting and Title */}
        <div>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            {getGreeting()}, {user?.employeeProfile ? user.employeeProfile.firstName : 'Admin'}
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }} className="header-date">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Header Actions */}
      <div className="header-actions">
        
        {/* Attendance Widget for Employees */}
        {!isAdmin && user?.employeeProfile && (
          <div className="attendance-widget">
            <Clock size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            
            {/* Clock Status text */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }} className="attendance-status">
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Shift Tracker</span>
              <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                {!clockStatus.clockedIn && 'Not Working'}
                {clockStatus.clockedIn && !clockStatus.clockedOut && `In: ${clockStatus.clockInTime}`}
                {clockStatus.clockedOut && `Out: ${clockStatus.clockOutTime}`}
              </span>
            </div>

            {/* Shift actions */}
            {!clockStatus.clockedIn ? (
              <button 
                onClick={handleClockIn} 
                disabled={clockStatus.loading}
                className="btn btn-primary" 
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
              >
                <Play size={12} fill="#fff" />
                <span className="btn-label">Clock In</span>
              </button>
            ) : !clockStatus.clockedOut ? (
              <button 
                onClick={handleClockOut} 
                disabled={clockStatus.loading}
                className="btn btn-danger" 
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
              >
                <Square size={12} fill="#fff" />
                <span className="btn-label">Clock Out</span>
              </button>
            ) : (
              <span className="badge badge-active" style={{ fontSize: '0.65rem' }}>Done</span>
            )}
          </div>
        )}

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="btn-icon"
          style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* User Card */}
        <div className="user-card">
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--primary)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.9rem',
            border: '2px solid var(--glass-border)',
            flexShrink: 0
          }}>
            {user?.employeeProfile ? user.employeeProfile.firstName[0] : 'A'}
          </div>
          <div className="user-info">
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
              {user?.employeeProfile ? `${user.employeeProfile.firstName} ${user.employeeProfile.lastName}` : 'Administrator'}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {user?.email}
            </span>
          </div>
        </div>

      </div>
    </header>
  );
};

export default Header;
