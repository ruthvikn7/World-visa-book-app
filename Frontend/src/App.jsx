import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import BookList from './Components/BookList';
import AuthPage from './Components/AuthPage';
import ProtectedRoute from './Components/ProtectedRoute';
import AddBookForm from './Components/AddBookForm';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/books" element={<ProtectedRoute><BookList /></ProtectedRoute>}/>
        <Route path="/add-book" element={<ProtectedRoute><AddBookForm /></ProtectedRoute>}/>
        {/* <Route path="/" element={<Navigate to="/books" />} /> */}
      </Routes>
    </BrowserRouter>
  )
}

export default App