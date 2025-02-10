import Book from '../Models/bookSchema.js';
import User from '../Models/userSchema.js';
import { calculateRecommendations } from '../utils/recommendationEngine.js';

export const getPersonalizedRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user?.preferences) {
      return res.status(400).json({ message: 'User preferences not set' });
    }

    const recommendations = await calculateRecommendations(user.preferences, user.readBooks);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSimilarBooks = async (req, res) => {
  try {
    const { bookId } = req.params;
    const book = await Book.findById(bookId);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const similarBooks = await Book.aggregate([
      {
        $match: {
          _id: { $ne: book._id },
          $or: [
            { genre: { $in: book.genre } },
            { author: book.author }
          ]
        }
      },
      {
        $addFields: {
          similarityScore: {
            $sum: [
              { $multiply: [
                { $size: { $setIntersection: ["$genre", book.genre] } },
                2
              ]},
              { $cond: [{ $eq: ["$author", book.author] }, 3, 0] },
              { $multiply: ["$averageRating", 0.5] }
            ]
          }
        }
      },
      { $sort: { similarityScore: -1 } },
      { $limit: 5 }
    ]);

    res.json(similarBooks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPopularBooks = async (req, res) => {
  try {
    const { genre } = req.query;
    const match = genre ? { genre: genre } : {};

    const popularBooks = await Book.aggregate([
      { $match: match },
      {
        $match: {
          totalRatings: { $gte: 10 } // Minimum ratings threshold
        }
      },
      {
        $addFields: {
          popularityScore: {
            $multiply: [
              "$averageRating",
              { $ln: { $add: ["$totalRatings", 1] } }
            ]
          }
        }
      },
      { $sort: { popularityScore: -1 } },
      { $limit: 10 }
    ]);

    res.json(popularBooks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};