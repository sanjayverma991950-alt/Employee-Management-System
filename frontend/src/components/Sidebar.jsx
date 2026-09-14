import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  CalendarDays, 
  LogOut,
  FolderLock,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen = false, onClose = () => {} }) => {
  const { logout, isAdmin } = useAuth();

  const menuItems = [
    { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/employees', name: 'Employees', icon: Users },
    { path: '/departments', name: 'Departments', icon: Building2 },
    { path: '/leaves', name: 'Leaves', icon: CalendarDays }
  ];

  return (
    <aside className={`sidebar glass${isOpen ? ' sidebar-open' : ''}`}>
      {/* Brand Title */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2.5rem',
        padding: '0 0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: '1.25rem'
          }}>
            E
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, lineHeight: 1.1 }}>EMPIRE</h2>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.1em' }}>STAFF WORKFLOW</span>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          className="btn-icon sidebar-close-btn"
          onClick={onClose}
          title="Close menu"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      {/* Nav Menu */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.85rem 1.25rem',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
                transition: 'all var(--transition-fast)',
                boxShadow: isActive ? 'var(--shadow-primary)' : 'none'
              })}
              className="sidebar-link"
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Role Identifier & Logout */}
      <div style={{
        borderTop: '1px solid var(--border-color)',
        paddingTop: '1.5rem',
        marginTop: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.5rem 0.75rem',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'rgba(255, 255, 255, 0.03)'
        }}>
          <FolderLock size={16} className="text-secondary" style={{ color: 'var(--primary)' }} />
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>Role Level</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>{isAdmin ? 'Administrator (Sanjay Verma)' : 'Employee Staff'}</div>
          </div>
        </div>

        <button 
          onClick={logout}
          className="btn btn-secondary"
          style={{ width: '100%', justifyContent: 'flex-start', border: '1px solid var(--border-color)' }}
        >
          <LogOut size={16} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
