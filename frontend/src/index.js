import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import App from './App';
import { LoginPage } from './pages/login';
import { SignUpPage } from './pages/signup';

ReactDOM.render(
  <BrowserRouter>
    <Routes>
      <Route path='/' element={<App />}>
          <Route path="login" element={<LoginPage />}/>
          <Route path="signup" element={<SignUpPage />}/>
        </Route>
    </Routes>
  </BrowserRouter>,
  document.getElementById('root')
);
