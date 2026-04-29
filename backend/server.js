const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Cloud-Ready MySQL Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '', 
    database: process.env.DB_NAME || 'ecommerce_db',
    port: process.env.DB_PORT || 3306
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

// Mock Payment Gateway (Simulating Stripe)
const processMockPayment = (cardNumber) => {
    return new Promise((resolve, reject) => {
        // Simulate network latency (1 second processing time)
        setTimeout(() => {
            // Stripe's official universal test card number
            if (cardNumber === '4242424242424242') {
                resolve({ status: 'success', transactionId: 'txn_' + Math.floor(Math.random() * 1000000) });
            } else {
                reject({ status: 'error', message: 'Card declined by issuing bank. Please use a valid card.' });
            }
        }, 1000); 
    });
};

// 4. Save Personalized Order (Now with Payment Validation!)
app.post('/api/orders', async (req, res) => {
    const { userId, date, total, items, statusStep, statusText, paymentDetails } = req.body;
    
    // Step 1: Verify the payment FIRST
    try {
        const paymentResult = await processMockPayment(paymentDetails.cardNumber);
        console.log(`Payment Approved: ${paymentResult.transactionId}`);
        
        // Step 2: Only if payment succeeds, save to MySQL
        const itemsJson = JSON.stringify(items);
        db.query('INSERT INTO orders (userId, date, total, items, statusStep, statusText) VALUES (?, ?, ?, ?, ?, ?)', 
        [userId, date, total, itemsJson, statusStep, statusText], (err, results) => {
            if (err) return res.status(500).json({ error: 'Database failed after payment', details: err.message });
            res.json({ message: 'Order saved successfully', orderId: results.insertId, transactionId: paymentResult.transactionId });
        });

    } catch (paymentError) {
        // Payment failed! Do not save to DB, return a 402 Payment Required error
        console.log(`Payment Failed: ${paymentError.message}`);
        return res.status(402).json({ error: paymentError.message });
    }
});

// 5. Admin: Fetch ALL Orders (Global)
app.get('/api/admin/orders', (req, res) => {
    db.query('SELECT * FROM orders ORDER BY id DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 6. Admin: Update Product Stock directly in MySQL
app.put('/api/products/:id', (req, res) => {
    const newStock = req.body.stock;
    const productId = req.params.id;
    
    db.query('UPDATE products SET stock = ? WHERE id = ?', [newStock, productId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Stock updated successfully' });
    });
});

// Cloud-Ready Port Listener
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Store Server running on port ${PORT}`));