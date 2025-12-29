import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { LogOut, User } from 'lucide-react';

export const Navbar = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          <span className="logo-text">TaskFlow</span>
        </Link>
        
        {user && (
          <div className="navbar-menu">
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/tasks" className="nav-link">Tasks</Link>
            {user.role === 'admin' && (
              <Link to="/users" className="nav-link">Users</Link>
            )}
            <div className="user-info">
              <User size={18} />
              <span>{user.firstName} {user.lastName}</span>
              <span className="badge">{user.role}</span>
            </div>
            <button onClick={handleLogout} className="btn-icon" title="Logout">
              <LogOut size={20} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
