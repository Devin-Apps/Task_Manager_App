import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/');
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
          setError('Login failed. Please check your credentials.');
        }
      }
    }
  };


  return (
    <div className="auth-container">
      <div className="auth-card glass-panel">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to manage your tasks</p>
        
        <form onSubmit={handleSubmit}>
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
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }}>
            Sign In
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)' }}>Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
