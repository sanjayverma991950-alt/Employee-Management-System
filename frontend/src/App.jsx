import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout & Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmployeeList from './pages/EmployeeList';
import DepartmentList from './pages/DepartmentList';
import LeaveManagement from './pages/LeaveManagement';

// Wrapper for checking authentication
const ProtectedLayout = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#0b0f19' }}>
        <div style={{
          border: '3px solid rgba(255,255,255,0.08)',
          borderTop: '3px solid #6366f1',
          borderRadius: '50%',
          width: '35px',
          height: '35px',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Header />
        {children}
      </main>
    </div>
  );
};

// Wrapper for preventing authenticated users from loading login
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          
          {/* Public Authentication */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />

          {/* Protected Main Panel routes */}
          <Route path="/dashboard" element={
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          } />
          
          <Route path="/employees" element={
            <ProtectedLayout>
              <EmployeeList />
            </ProtectedLayout>
          } />

          <Route path="/departments" element={
            <ProtectedLayout>
              <DepartmentList />
            </ProtectedLayout>
          } />

          <Route path="/leaves" element={
            <ProtectedLayout>
              <LeaveManagement />
            </ProtectedLayout>
          } />

          {/* Root Fallbacks */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />

        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
