import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css'
import Home from './pages/Home';
import Programs from './pages/Programs';
import NavBar from './components/NavBar';

function App() {

  return (
    <BrowserRouter>
      <div className='wrapper'>
        <NavBar/>
        <Routes>
          <Route path="" element={<Home />}/>
          <Route path="/programs" element={<Programs />}/>
        </Routes>
      </div>
    </BrowserRouter>
  )
};

export default App;
