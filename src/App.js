import React from 'react';
import Navbar from './components/Navbar';
//import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LoginPage from './pages/LoginPage';
import CardPage from './pages/CardPage';
import RegisterPage from './pages/RegisterPage';
import EmailVerifPage from './pages/EmailVerifPage';
import { CalPage } from './CalPage';

function App() {
  return (
    <>
    <Router>
    <Navbar />
      <Routes>
        <Route path="/" index element={<Home />} />   
        <Route path="/login" index element={<LoginPage />} /> 
        <Route path="/cards" index element={<CardPage />} />  
        <Route path="/register" index element={<RegisterPage />} />  
        <Route path="/emailVerif" index element={<EmailVerifPage />} />
        <Route path="/cal" index element={<CalPage />} /> 
      </Routes>
    </Router>
    </>
  );
}

export default App;