const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'ecommerce_db'
});

db.connect(err => {
    if (err) console.error('Database connection failed:', err);
    else console.log('Connected successfully to MySQL Database.');
});

// 1. Fetch Catalog
app.get('/api/products', (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results.map(p => ({...p, price: parseFloat(p.price), rating: parseFloat(p.rating)})));
    });
});

// 2. Authentication (Auto-Register if user is new)
app.post('/api/auth', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT id FROM users WHERE username = ?', [username], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (results.length > 0) {
            // User exists, verify password
            db.query('SELECT id FROM users WHERE username = ? AND password = ?', [username, password], (err, loginRes) => {
                if (loginRes.length === 0) return res.status(401).json({ error: 'Incorrect password' });
                res.json({ userId: loginRes[0].id });
            });
        } else {
            // User does not exist, auto-create account
            db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], (err, regRes) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ userId: regRes.insertId });
            });
        }
    });
});

// 3. Fetch Personalized Orders
app.get('/api/orders/:userId', (req, res) => {
    db.query('SELECT * FROM orders WHERE userId = ? ORDER BY id DESC', [req.params.userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 4. Save Personalized Order
app.post('/api/orders', (req, res) => {
    const { userId, date, total, items, statusStep, statusText } = req.body;
    const itemsJson = JSON.stringify(items);
    
    db.query('INSERT INTO orders (userId, date, total, items, statusStep, statusText) VALUES (?, ?, ?, ?, ?, ?)', 
    [userId, date, total, itemsJson, statusStep, statusText], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Order saved successfully', orderId: results.insertId });
    });
});

app.listen(3000, () => console.log('Store Server running on http://localhost:3000'));