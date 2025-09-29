import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MainApp from './pages/MainApp';
import History from './pages/History';
import AuthSuccess from './pages/AuthSuccess';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/app" element={<MainApp />} />
        <Route path="/history" element={<History />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
      </Routes>
    </Router>
  );
}

export default App;
