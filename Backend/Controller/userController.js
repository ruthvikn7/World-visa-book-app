import User from '../Models/userSchema.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Authentication Controllers
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check existing user
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email ? 'Email already exists' : 'Username already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      preferences: {
        favoriteGenres: [],
        favoriteAuthors: [],
        readingLevel: 'beginner'
      }
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        preferences: user.preferences
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        preferences: user.preferences
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Profile Management
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('readBooks', 'title author')
      .populate('wishlist', 'title author');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { username, email } = req.body;

    // Check if new email/username is already taken
    if (email || username) {
      const existingUser = await User.findOne({
        $and: [
          { _id: { $ne: req.user.id } },
          { $or: [
            { email: email || '' },
            { username: username || '' }
          ]}
        ]
      });

      if (existingUser) {
        return res.status(400).json({
          message: existingUser.email === email ? 'Email already taken' : 'Username already taken'
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: req.body },
      { new: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Preferences Management
export const updatePreferences = async (req, res) => {
  try {
    const { favoriteGenres, favoriteAuthors, readingLevel } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        preferences: {
          favoriteGenres: favoriteGenres || [],
          favoriteAuthors: favoriteAuthors || [],
          readingLevel: readingLevel || 'beginner'
        }
      },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Reading List Management
export const addToReadingList = async (req, res) => {
  try {
    const { bookId, listType } = req.body;

    if (!['readBooks', 'wishlist'].includes(listType)) {
      return res.status(400).json({ message: 'Invalid list type' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { [listType]: bookId } },
      { new: true }
    ).select('-password')
      .populate(listType, 'title author');

    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const removeFromReadingList = async (req, res) => {
  try {
    const { bookId, listType } = req.params;

    if (!['readBooks', 'wishlist'].includes(listType)) {
      return res.status(400).json({ message: 'Invalid list type' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { [listType]: bookId } },
      { new: true }
    ).select('-password')
      .populate(listType, 'title author');

    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};