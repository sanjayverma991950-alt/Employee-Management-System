import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Sun, 
  Moon, 
  User, 
  Clock, 
  Play, 
  Square 
} from 'lucide-react';

const Header = () => {
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
    <header className="glass" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1.25rem 2rem',
      borderBottom: '1px solid var(--glass-border)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Greeting and Title */}
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
          {getGreeting()}, {user?.employeeProfile ? user.employeeProfile.firstName : 'Admin'}
        </h1>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Header Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        
        {/* Attendance Widget for Employees */}
        {!isAdmin && user?.employeeProfile && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            fontSize: '0.85rem'
          }}>
            <Clock size={16} style={{ color: 'var(--primary)' }} />
            
            {/* Clock Status text */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', marginRight: '0.5rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Shift Tracker</span>
              <span style={{ fontWeight: 600 }}>
                {!clockStatus.clockedIn && 'Not Working'}
                {clockStatus.clockedIn && !clockStatus.clockedOut && `Working since ${clockStatus.clockInTime}`}
                {clockStatus.clockedOut && `Finished shift at ${clockStatus.clockOutTime}`}
              </span>
            </div>

            {/* Shift actions */}
            {!clockStatus.clockedIn ? (
              <button 
                onClick={handleClockIn} 
                disabled={clockStatus.loading}
                className="btn btn-primary" 
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
              >
                <Play size={12} fill="#fff" />
                Clock In
              </button>
            ) : !clockStatus.clockedOut ? (
              <button 
                onClick={handleClockOut} 
                disabled={clockStatus.loading}
                className="btn btn-danger" 
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
              >
                <Square size={12} fill="#fff" />
                Clock Out
              </button>
            ) : (
              <span className="badge badge-active" style={{ fontSize: '0.65rem' }}>Done for Day</span>
            )}
          </div>
        )}

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="btn-icon"
          style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* User Card */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          paddingLeft: '1.25rem',
          borderLeft: '1px solid var(--border-color)'
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--primary)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.9rem',
            border: '2px solid var(--glass-border)'
          }}>
            {user?.employeeProfile ? user.employeeProfile.firstName[0] : 'A'}
          </div>
          <div style={{ display: 'none', flexDirection: 'column' }} className="d-md-flex">
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
