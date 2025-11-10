import { Link } from 'react-router-dom';
import { CheckSquare, Users, TrendingUp, Shield } from 'lucide-react';
import { authService } from '../services/authService';

export const Home = () => {
  const user = authService.getCurrentUser();

  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Task Management Made Simple</h1>
          <p className="hero-subtitle">
            Organize, prioritize, and track your tasks efficiently with our intuitive task management system.
          </p>
          {user ? (
            <Link to="/tasks" className="btn btn-primary btn-lg">
              Go to Tasks
            </Link>
          ) : (
            <div className="hero-actions">
              <Link to="/signup" className="btn btn-primary btn-lg">
                Get Started
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg">
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="features-section">
        <h2 className="section-title">Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <CheckSquare size={40} />
            </div>
            <h3>Task Management</h3>
            <p>Create, update, and organize tasks with different priorities and statuses.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <TrendingUp size={40} />
            </div>
            <h3>Priority Filtering</h3>
            <p>Filter tasks by priority levels to focus on what matters most.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Users size={40} />
            </div>
            <h3>User Management</h3>
            <p>Admin users can manage team members and assign roles.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Shield size={40} />
            </div>
            <h3>Secure Authentication</h3>
            <p>JWT-based authentication ensures your data stays protected.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
