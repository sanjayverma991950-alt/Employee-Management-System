import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Users, 
  Building2, 
  CalendarDays, 
  Percent, 
  ArrowUpRight, 
  Clock, 
  UserPlus, 
  CalendarCheck 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    pendingLeaves: 0,
    attendanceRate: 100,
    recentLeaves: [],
    deptDistribution: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [empRes, deptRes, leaveRes, attendanceRes] = await Promise.all([
          api.get('/employees'),
          api.get('/departments'),
          api.get('/leaves'),
          api.get('/leaves/attendance/logs')
        ]);

        if (empRes.success && deptRes.success && leaveRes.success && attendanceRes.success) {
          const employees = empRes.data;
          const departments = deptRes.data;
          const leaves = leaveRes.data;
          const attendanceLogs = attendanceRes.data;

          // 1. Calculate general metrics
          const pending = leaves.filter(l => l.status === 'Pending').length;
          
          // 2. Attendance rate calculation
          let rate = 100;
          if (attendanceLogs.length > 0) {
            const presentOrLate = attendanceLogs.filter(log => log.status === 'Present' || log.status === 'Late').length;
            rate = Math.round((presentOrLate / attendanceLogs.length) * 100);
          }

          // 3. Department distribution count
          const deptCount = {};
          employees.forEach(emp => {
            if (emp.department) {
              const name = emp.department.name;
              deptCount[name] = (deptCount[name] || 0) + 1;
            }
          });
          const distribution = Object.keys(deptCount).map(name => ({
            name,
            count: deptCount[name]
          }));

          setStats({
            totalEmployees: employees.length,
            totalDepartments: departments.length,
            pendingLeaves: pending,
            attendanceRate: rate,
            recentLeaves: leaves.slice(0, 4),
            deptDistribution: distribution
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard statistics', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <div style={{
          border: '3px solid var(--border-color)',
          borderTop: '3px solid var(--primary)',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Dashboard metric cards definition
  const metricCards = [
    { title: 'Total Employees', value: stats.totalEmployees, icon: Users, color: 'var(--primary)', link: '/employees' },
    { title: 'Departments', value: stats.totalDepartments, icon: Building2, color: 'var(--info)', link: '/departments' },
    { title: 'Pending Leaves', value: stats.pendingLeaves, icon: CalendarDays, color: 'var(--warning)', link: '/leaves' },
    { title: 'Attendance Rate', value: `${stats.attendanceRate}%`, icon: Percent, color: 'var(--secondary)', link: '/leaves' }
  ];

  return (
    <div className="page-container">
      
      {/* Welcome Banner */}
      <div className="glass" style={{
        padding: '2.25rem',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(16, 185, 129, 0.03)), var(--glass-bg)',
        border: '1px solid var(--glass-border)'
      }}>
        <h2 style={{ fontSize: '1.65rem', marginBottom: '0.5rem', fontWeight: 800 }}>
          {isAdmin ? 'System Overview Panel' : 'Employee Portal Dashboard'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '600px' }}>
          {isAdmin 
            ? 'Access global metrics, manage corporate leave logs, edit employee directories, and view departmental budgets from a centralized control deck.'
            : 'Track your work shifts, submit leave requests, monitor request reviews, and stay connected with department records.'
          }
        </p>
      </div>

      {/* Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {metricCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link 
              key={index} 
              to={card.link}
              style={{ textDecoration: 'none' }}
              className="glass glass-hover"
            >
              <div style={{
                padding: '1.5rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {card.title}
                  </span>
                  <h3 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                    {card.value}
                  </h3>
                </div>
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: card.color
                }}>
                  <Icon size={22} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main Grid Widgets */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '1.5rem'
      }}>
        
        {/* Department Distribution Chart */}
        <div className="glass" style={{ padding: '1.75rem', borderRadius: 'var(--radius-md)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={18} style={{ color: 'var(--primary)' }} />
            <span>Staff Headcount by Department</span>
          </h3>

          {stats.deptDistribution.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No employee records found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {stats.deptDistribution.map((item, idx) => {
                const maxCount = Math.max(...stats.deptDistribution.map(d => d.count));
                const percent = (item.count / stats.totalEmployees) * 100;
                const widthPercent = (item.count / maxCount) * 100;

                // Color rotations
                const colors = ['var(--primary)', 'var(--info)', 'var(--secondary)'];
                const barColor = colors[idx % colors.length];

                return (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 700 }}>{item.name}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{item.count} head ({Math.round(percent)}%)</span>
                    </div>
                    {/* SVG Bar Chart simulation */}
                    <div style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: 'var(--bg-tertiary)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${widthPercent}%`,
                        height: '100%',
                        backgroundColor: barColor,
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 1s ease-out'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Leave Requests */}
        <div className="glass" style={{ padding: '1.75rem', borderRadius: 'var(--radius-md)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarCheck size={18} style={{ color: 'var(--warning)' }} />
            <span>Recent Leave Activities</span>
          </h3>

          {stats.recentLeaves.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No leave requests logged.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {stats.recentLeaves.map((leave, idx) => {
                const badgeClass = `badge badge-${leave.status.toLowerCase()}`;
                
                return (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-color)'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                        {leave.employee ? `${leave.employee.firstName} ${leave.employee.lastName}` : 'System User'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        {leave.type} Leave | {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                      </div>
                    </div>
                    <span className={badgeClass} style={{ fontSize: '0.65rem' }}>{leave.status}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Quick Action Deck for Admin */}
      {isAdmin && (
        <div className="glass" style={{
          padding: '1.5rem',
          borderRadius: 'var(--radius-md)',
          marginTop: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          border: '1px dashed var(--border-color)'
        }}>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Corporate Administrator Operations</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quick shortcuts for routine employee logs management.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/employees" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              <UserPlus size={16} />
              <span>Add Employee</span>
            </Link>
            <Link to="/leaves" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
              <CalendarDays size={16} />
              <span>Review Leaves</span>
            </Link>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
