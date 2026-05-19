import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('member');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', { name, email, password, role });
      navigate('/login');
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to server. Please make sure your FastAPI backend is running on port 8000!');
      } else {
        const detail = err.response?.data?.detail;
        if (Array.isArray(detail)) {
          setError(detail.map(d => d.msg).join(', '));
        } else if (typeof detail === 'string') {
          setError(detail);
        } else {
          setError('Registration failed. Please check your inputs.');
        }
      }
    }
  };


  return (
    <div className="auth-container">
      <div className="auth-card glass-panel">
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join OurManager today</p>

        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="member">Team Member</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }}>
            Register
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)' }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
