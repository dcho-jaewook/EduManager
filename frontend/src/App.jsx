import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css'
import Home from './pages/Home';
import Programs from './pages/Programs';
import NavBar from './components/NavBar';
import AuthCallback from './pages/AuthCallback';
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
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
};

export default App;
