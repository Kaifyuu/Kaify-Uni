const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db'); // Import your promise-based DB pool

// --- REGISTRATION ROUTE ---
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const [existingUsers] = await db.query('SELECT * FROM users WHERE username = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'Email already in use.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query(
            'INSERT INTO users (name, username, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );

        res.status(201).json({ message: 'Registration successful!' });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: 'Server error during registration.' });
    }
});

// --- LOGIN ROUTE ---
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body; 

        const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const token = jwt.sign({ id: user.id }, 'your_jwt_secret', { expiresIn: '1h' });
        res.status(200).json({ token: token, userId: user.id });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: 'Server error during login.' });
    }
});

module.exports = router;