// services/bookService.js
import axios from 'axios';
import { getAuthHeader } from './authService';

const API_URL = 'http://localhost:5000/api';

export const getBooks = async (page = 1, limit = 10) => {
  const response = await axios.get(
    `${API_URL}/books?page=${page}&limit=${limit}`
  );
  return response.data;
};

export const searchBooks = async (query) => {
  const response = await axios.get(
    `${API_URL}/books/search?query=${encodeURIComponent(query)}`
  );
  return response.data;
};

export const getRecommendations = async () => {
  const response = await axios.get(
    `${API_URL}/recommendations/personalized`,
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const getBookReviews = async (bookId, page = 1, limit = 10) => {
  const response = await axios.get(
    `${API_URL}/books/${bookId}/reviews?page=${page}&limit=${limit}`
  );
  return response.data;
};

export const createReview = async (bookId, rating, comment) => {
  const response = await axios.post(
    `${API_URL}/books/${bookId}/reviews`,
    { rating, comment },
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const updateUserPreferences = async (preferences) => {
  const response = await axios.put(
    `${API_URL}/users/preferences`,
    preferences,
    { headers: getAuthHeader() }
  );
  return response.data;
};