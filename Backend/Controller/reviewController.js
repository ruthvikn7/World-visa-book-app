import Review from '../Models/reviewSchema.js';
import Book from '../Models/bookSchema.js';
import mongoose from 'mongoose';

export const createReview = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { bookId } = req.params;
    const userId = req.user.id;
    const { rating, comment } = req.body;

    // Check for existing review
    const existingReview = await Review.findOne({ userId, bookId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this book' });
    }

    // Create new review
    const review = new Review({
      userId,
      bookId,
      rating,
      comment
    });
    
    await review.save({ session });

    // Update book ratings
    const reviews = await Review.find({ bookId });
    const averageRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;
    
    await Book.findByIdAndUpdate(
      bookId,
      {
        averageRating: Number(averageRating.toFixed(1)),
        totalRatings: reviews.length
      },
      { session }
    );

    await session.commitTransaction();
    
    const populatedReview = await Review.findById(review._id)
      .populate('userId', 'username')
      .populate('bookId', 'title');

    res.status(201).json(populatedReview);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ error: error.message });
  } finally {
    session.endSession();
  }
};

export const updateReview = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { reviewId } = req.params;
    const userId = req.user.id;
    const { rating, comment } = req.body;

    const review = await Review.findOne({ _id: reviewId, userId });
    if (!review) {
      return res.status(404).json({ message: 'Review not found or unauthorized' });
    }

    review.rating = rating;
    review.comment = comment;
    await review.save({ session });

    // Update book ratings
    const bookId = review.bookId;
    const reviews = await Review.find({ bookId });
    const averageRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;

    await Book.findByIdAndUpdate(
      bookId,
      {
        averageRating: Number(averageRating.toFixed(1))
      },
      { session }
    );

    await session.commitTransaction();
    
    const populatedReview = await Review.findById(review._id)
      .populate('userId', 'username')
      .populate('bookId', 'title');

    res.json(populatedReview);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ error: error.message });
  } finally {
    session.endSession();
  }
};

export const getBookReviews = async (req, res) => {
  try {
    const { bookId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ bookId })
      .populate('userId', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ bookId });

    res.json({
      reviews,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalReviews: total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteReview = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    const review = await Review.findOneAndDelete(
      { _id: reviewId, userId },
      { session }
    );

    if (!review) {
      return res.status(404).json({ message: 'Review not found or unauthorized' });
    }

    // Update book ratings
    const bookId = review.bookId;
    const reviews = await Review.find({ bookId });
    const averageRating = reviews.length 
      ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
      : 0;

    await Book.findByIdAndUpdate(
      bookId,
      {
        averageRating: Number(averageRating.toFixed(1)),
        totalRatings: reviews.length
      },
      { session }
    );

    await session.commitTransaction();
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: error.message });
  } finally {
    session.endSession();
  }
};