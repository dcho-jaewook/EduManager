import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css'
import Home from './pages/Home';
import Programs from './pages/Programs';
import ProgramCreate from './pages/ProgramCreate';
import NavBar from './components/NavBar';
import AuthCallback from './pages/AuthCallback';
import AdminPage from './pages/AdminPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

function App() {

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className='wrapper'>
          <NavBar/>
          <Routes>
            <Route path="/" element={<Home />}/>
            <Route path="/programs" element={<Programs />}/>
            <Route path="/auth/callback" element={<AuthCallback />}/>
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/programs/create" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <ProgramCreate />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
};

export default App;
