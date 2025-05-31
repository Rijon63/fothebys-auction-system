import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    console.log('Register attempt on server:', { username, email, password, role }); // Log request

    if (!username || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (!['admin', 'seller', 'buyer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role,
    });
    await user.save();
    const token = jwt.sign(
      { clientId: user.clientId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.status(201).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        clientId: user.clientId,
      },
    });
  } catch (err) {
    console.error('Error registering user:', err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Username, email, or client ID already exists' });
    }
    res.status(500).json({ error: 'Failed to register user. Please try again.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt on server:', { email, password }); // Log request
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { clientId: user.clientId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.status(200).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        clientId: user.clientId,
      },
    });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ error: 'Failed to log in. Please try again.' });
  }
});

export default router;