// routes/userRoutes.js
import express from 'express';
import { 
  register,
  login,
  getProfile,
  updateProfile,
  updatePreferences,
  addToReadingList,
  removeFromReadingList,
  changePassword
} from '../Controller/userController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRegistration, validateLogin } from '../middleware/validation.js';

const router = express.Router();

// Auth routes
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);

// Profile routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

// Preferences routes
router.put('/preferences', authenticate, updatePreferences);

// Reading list routes
router.post('/reading-list', authenticate, addToReadingList);
router.delete('/reading-list/:listType/:bookId', authenticate, removeFromReadingList);

// Password management
router.put('/change-password', authenticate, changePassword);

export default router;

