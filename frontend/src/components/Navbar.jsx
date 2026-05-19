import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, CheckSquare } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <CheckSquare color="var(--primary)" /> OurManager
      </div>

      <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
        <LogOut size={16} /> Logout
      </button>
    </nav>
  );
};

export default Navbar;
