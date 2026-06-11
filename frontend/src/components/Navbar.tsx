import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Car, LayoutDashboard, User, LogOut, LogIn, UserPlus } from 'lucide-react';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="glass-panel" style={{
      position: 'sticky',
      top: '20px',
      left: '20px',
      right: '20px',
      margin: '0 20px 20px 20px',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 24px',
      borderRadius: '14px',
      border: '1px solid var(--border-glass)'
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
          padding: '8px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)'
        }}>
          <Car size={20} color="#fff" />
        </div>
        <span style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 800,
          fontSize: '18px',
          letterSpacing: '-0.03em'
        }} className="text-gradient">
          DamageAI
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {token ? (
          <>
            <Link to="/dashboard" className="btn" style={{
              background: isActive('/dashboard') ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              color: isActive('/dashboard') ? 'var(--text-primary)' : 'var(--text-secondary)',
              border: isActive('/dashboard') ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid transparent',
              padding: '8px 16px',
              fontSize: '13.5px'
            }}>
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
            <Link to="/profile" className="btn" style={{
              background: isActive('/profile') ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              color: isActive('/profile') ? 'var(--text-primary)' : 'var(--text-secondary)',
              border: isActive('/profile') ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid transparent',
              padding: '8px 16px',
              fontSize: '13.5px'
            }}>
              <User size={16} />
              Profile
            </Link>
            <div style={{
              width: '1px',
              height: '20px',
              background: 'var(--border-glass)',
              margin: '0 8px'
            }}></div>
            <span style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              fontWeight: 500,
              marginRight: '8px'
            }}>
              Hi, <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{user?.name || 'User'}</span>
            </span>
            <button onClick={handleLogout} className="btn btn-secondary" style={{
              padding: '8px 14px',
              fontSize: '13px',
              gap: '6px'
            }}>
              <LogOut size={14} />
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn" style={{
              background: 'transparent',
              color: 'var(--text-primary)',
              padding: '8px 16px',
              fontSize: '13.5px'
            }}>
              <LogIn size={16} />
              Login
            </Link>
            <Link to="/signup" className="btn btn-primary" style={{
              padding: '8px 16px',
              fontSize: '13.5px'
            }}>
              <UserPlus size={16} />
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};
