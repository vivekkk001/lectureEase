// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Signup Route
router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body; // Destructure name along with email and password

    // Check if all fields are provided
    if (!name || !email || !password) {
        return res.status(400).send({ message: 'Name, email, and password are required' });
    }

    try {
        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).send({ message: 'Email is already in use' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user with the name, email, and password
        const newUser = new User({ name, email, password: hashedPassword });

        // Save user to the database
        await newUser.save();
        res.status(201).send({ message: 'User created successfully' });

    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});


// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({ message: 'Email and password are required' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send({ message: 'Invalid email or password' });
        }

        // Compare password with the stored hash
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send({ message: 'Invalid email or password' });
        }

        // Generate JWT Token
        const token = jwt.sign({ userId: user._id }, 'yourSecretKey', { expiresIn: '1h' });

        res.status(200).send({ message: 'Login successful', token });

    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

module.exports = router;
