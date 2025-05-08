import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css'
import Home from './pages/Home';
import Programs from './pages/Programs';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="" element={<Home />}/>
        <Route path="/programs" element={<Programs />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App;
