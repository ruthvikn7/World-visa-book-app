import express from 'express';
import {
  createReview,
  updateReview,
  getBookReviews,
  deleteReview
} from '../Controller/reviewController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/books/:bookId/reviews', authenticate, createReview);
router.get('/books/:bookId/reviews', getBookReviews);
router.put('/reviews/:reviewId', authenticate, updateReview);
router.delete('/reviews/:reviewId', authenticate, deleteReview);

export default router;