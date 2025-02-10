import express from 'express';
import { getBooks, getBookById, createBook, updateBook, deleteBook, searchBooks } from '../Controller/bookController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getBooks);
router.get('/search', searchBooks);
router.get('/:id', getBookById);
router.post('/', authenticate, createBook);
router.put('/:id', authenticate, updateBook);
router.delete('/:id', authenticate, deleteBook);

export default router;
