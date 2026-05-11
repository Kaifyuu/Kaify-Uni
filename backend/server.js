// This MUST be at the very top of server.js
require('dotenv').config(); 
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'super-secret-key-change-in-production';

const app = express();
app.use(cors());
app.use(express.json());

// Add this near the top of server.js where you define your app
const productRoutes = require('./routes/products');
const checkoutRoutes = require('./routes/checkout');
const authRoutes = require('./routes/auth');
app.use('/api', authRoutes); // This automatically handles /api/login and /api/register

// Cloud-Ready MySQL Connection
const db = require('./db');

// Delete your old app.get('/api/products', ...) block.
// Replace it with this single line:
app.use('/api/products', productRoutes);
app.use('/api/checkout', checkoutRoutes); 

// --- FETCH ORDERS ROUTE ---
app.get('/api/orders/:userId', async (req, res) => {
    try {
        const [orders] = await db.query('SELECT * FROM orders WHERE userId = ?', [req.params.userId]);
        res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ error: "Failed to fetch order history." });
    }
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

// Render provides the PORT variable automatically
const PORT = process.env.PORT || 3000; 

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});