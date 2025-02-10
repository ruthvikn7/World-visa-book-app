import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bookRoutes from './Routes/bookRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/books', bookRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/reviews', reviewRoutes);

// Error handling
app.use(errorHandler);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));