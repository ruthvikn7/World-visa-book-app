import express from 'express';
import { 
  getPersonalizedRecommendations,
  getSimilarBooks,
  getPopularBooks
} from '../Controller/recommendationController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/personalized', authenticate, getPersonalizedRecommendations);
router.get('/similar/:bookId', getSimilarBooks);
router.get('/popular', getPopularBooks);

export default router;