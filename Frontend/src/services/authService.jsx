// services/authService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; 

export const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/users/login`, { email, password });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const register = async (username, email, password) => {
  const response = await axios.post(`${API_URL}/users/register`, {
    username,
    email,
    password,
  });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};