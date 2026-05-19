import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProjectDetails from './pages/ProjectDetails';
import Navbar from './components/Navbar';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={
          <PrivateRoute>
            <>
              <Navbar />
              <Dashboard />
            </>
          </PrivateRoute>
        } />

        <Route path="/projects/:id" element={
          <PrivateRoute>
            <>
              <Navbar />
              <ProjectDetails />
            </>
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

