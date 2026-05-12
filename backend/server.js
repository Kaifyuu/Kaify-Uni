// This MUST be at the very top of server.js
require('dotenv').config(); 
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10kb' }));

// --- JWT VERIFICATION MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid or expired token." });
        req.user = user;
        next();
    });
};

const adminOnly = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ error: "Access denied. Admin privileges required." });
    }
    next();
};

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
app.use('/api/checkout', authenticateToken, checkoutRoutes); 

// --- FETCH ORDERS ROUTE ---
app.get('/api/orders/:userId', authenticateToken, async (req, res) => {
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
app.post('/api/orders', authenticateToken, async (req, res) => {
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
app.get('/api/admin/orders', authenticateToken, adminOnly, async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM orders ORDER BY id DESC');
        res.json(results);
    } catch (err) {
        console.error("Admin Orders Error:", err); // Developer sees this
        res.status(500).json({ error: "Failed to retrieve admin orders." }); // User sees this
    }
});

// 6. Admin: Cancel Order (Return stock + add comment)
app.put('/api/admin/orders/:id/cancel', authenticateToken, adminOnly, async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const orderId = req.params.id;
        const { comment } = req.body;

        // 1. Check if already cancelled
        const [order] = await connection.query('SELECT statusStep FROM orders WHERE id = ?', [orderId]);
        if (order.length === 0) throw new Error("Order not found");
        if (order[0].statusStep === -1) throw new Error("Order already cancelled");

        // 2. Get items to return stock
        const [items] = await connection.query('SELECT productId, quantity FROM order_items WHERE orderId = ?', [orderId]);
        
        for (const item of items) {
            await connection.query('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.productId]);
        }

        // 3. Update order status and comment
        await connection.query(
            'UPDATE orders SET statusStep = -1, statusText = "Cancelled", cancelComment = ? WHERE id = ?',
            [comment || "No reason provided", orderId]
        );

        await connection.commit();
        res.json({ message: "Order cancelled and stock returned." });
    } catch (err) {
        await connection.rollback();
        console.error("Cancel Order Error:", err);
        res.status(500).json({ error: err.message || "Failed to cancel order." });
    } finally {
        connection.release();
    }
});

// 7. Admin: Delete Order (Return stock if not already cancelled, then delete)
app.delete('/api/admin/orders/:id', authenticateToken, adminOnly, async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const orderId = req.params.id;

        const [order] = await connection.query('SELECT statusStep FROM orders WHERE id = ?', [orderId]);
        if (order.length === 0) throw new Error("Order not found");

        // If not already cancelled, return the stock first
        if (order[0].statusStep !== -1) {
            const [items] = await connection.query('SELECT productId, quantity FROM order_items WHERE orderId = ?', [orderId]);
            for (const item of items) {
                await connection.query('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.productId]);
            }
        }

        // Delete (order_items has CASCADE normally, but let's be safe or check FK)
        await connection.query('DELETE FROM orders WHERE id = ?', [orderId]);

        await connection.commit();
        res.json({ message: "Order deleted and stock returned." });
    } catch (err) {
        await connection.rollback();
        console.error("Delete Order Error:", err);
        res.status(500).json({ error: "Failed to delete order." });
    } finally {
        connection.release();
    }
});

// 8. Admin: Advance Order Status (Multi-Step Logic)
app.put('/api/admin/orders/:id/status', authenticateToken, adminOnly, async (req, res) => {
    try {
        const orderId = req.params.id;
        
        // Step A: Check the current status
        const [results] = await db.query('SELECT statusStep FROM orders WHERE id = ?', [orderId]);
        
        if (results.length === 0) {
            return res.status(404).json({ error: "Order not found." });
        }
        
        let currentStep = results[0].statusStep;
        
        // Gatekeeper Validation: Stop if it's already delivered or cancelled
        if (currentStep >= 3) {
            return res.status(400).json({ error: "Order is already fully delivered." });
        }
        if (currentStep === -1) {
            return res.status(400).json({ error: "Cannot advance a cancelled order." });
        }
        
        // Step B: Calculate the next step and text
        const nextStep = currentStep + 1;
        let nextText = "Placed";
        if (nextStep === 1) nextText = "Packed";
        if (nextStep === 2) nextText = "Shipped";
        if (nextStep === 3) nextText = "Delivered";
        
        // Step C: Save to database
        await db.query('UPDATE orders SET statusStep = ?, statusText = ? WHERE id = ?', [nextStep, nextText, orderId]);
        res.json({ message: "Order advanced successfully", newStep: nextStep, newText: nextText });
    } catch (err) {
        console.error("Status Update Error:", err);
        res.status(500).json({ error: "Failed to advance order status." });
    }
});

// Global Error Handler for "Go-Live"
app.use((err, req, res, next) => {
    console.error("Internal Server Error:", err.stack); // Log internally for developer
    if (process.env.NODE_ENV === 'production') {
        res.status(500).json({ error: "Internal Server Error" }); // Hide stack trace from user
    } else {
        res.status(500).json({ error: err.message, stack: err.stack });
    }
});

// Render provides the PORT variable automatically
const PORT = process.env.PORT || 3000; 

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});