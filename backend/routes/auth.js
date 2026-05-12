const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db'); 

// --- REGISTRATION ROUTE ---
router.post('/register', async (req, res) => {
    try {
        // We still accept 'name' from the frontend so the UI doesn't crash, 
        // but we will ignore it in the database query.
        const { name, email, password } = req.body;

        const [existingUsers] = await db.query('SELECT * FROM users WHERE username = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'Email already in use.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // THE FIX: Removed 'name' from the INSERT query to match your database schema
        await db.query(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [email, hashedPassword]
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

        const token = jwt.sign({ id: user.id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '1h' });    
        res.status(200).json({ token, userId: user.id, isAdmin: user.isAdmin });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: 'Server error during login.' });
    }
});

module.exports = router;