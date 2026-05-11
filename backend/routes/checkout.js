const express = require('express');
const router = express.Router();
const db = require('../db'); 

router.post('/', async (req, res) => {
    const connection = await db.getConnection(); // Get a connection for the transaction
    try {
        const { userId, items, email, cardNumber, shippingMethod } = req.body;

        // --- GATEKEEPER VALIDATION ---
        if (!items || items.length === 0) return res.status(400).json({ error: "Cart is empty." });
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) return res.status(400).json({ error: "Invalid email." });

        const ccRegex = /^\d{16}$/;
        if (!cardNumber || !ccRegex.test(cardNumber)) return res.status(400).json({ error: "Invalid card format." });
        
        // --- ATOMIC PERSISTENCE (Session 7 & Bonus A: Stock Check) ---
        await connection.beginTransaction();

        // --- CALCULATION & INVENTORY VERIFICATION ---
        const itemIds = items.map(item => item.id);
        
        // We moved this query inside the transaction and added 'stock' and 'FOR UPDATE'
        const [dbProducts] = await connection.query(`SELECT id, price, stock FROM products WHERE id IN (?) FOR UPDATE`, [itemIds]);
        
        const trueData = {};
        dbProducts.forEach(p => { 
            trueData[p.id] = { price: parseFloat(p.price), stock: parseInt(p.stock) }; 
        });

        let serverTotal = 0;
        for (const item of items) {
            const dbItem = trueData[item.id];
            if (!dbItem) throw new Error(`Product ${item.id} not found.`);
            
            // The Fix: Prevent Unsigned Integer crash and block overselling
            if (dbItem.stock < item.quantity) {
                throw new Error(`Out of stock: Only ${dbItem.stock} left for item ID ${item.id}.`);
            }

            serverTotal += (dbItem.price * item.quantity);
            item.price = dbItem.price; 
        }
        serverTotal += parseFloat(shippingMethod);

        const date = new Date().toISOString().slice(0, 19).replace('T', ' '); // MySQL format
        
        // 1. Insert the Parent Order
        const [orderResult] = await connection.query(
            'INSERT INTO orders (userId, date, total, statusStep, statusText) VALUES (?, ?, ?, ?, ?)',
            [userId, date, serverTotal.toFixed(2), 1, "Placed"]
        );
        const newOrderId = orderResult.insertId;

        // 2. Insert Child Items (Session 8: Normalization)
        const orderItemEntries = items.map(item => [newOrderId, item.id, item.quantity, item.price]);
        await connection.query(
            'INSERT INTO order_items (orderId, productId, quantity, price) VALUES ?',
            [orderItemEntries]
        );

        // 3. Decrement Product Stock safely
        for (const item of items) {
            await connection.query(
                'UPDATE products SET stock = stock - ? WHERE id = ?',
                [item.quantity, item.id]
            );
        }

        await connection.commit();
        res.status(200).json({ message: "Order placed successfully!", orderTotal: serverTotal.toFixed(2) });

    } catch (error) {
        await connection.rollback();
        console.error("Checkout Error:", error);
        
        // Expose the true error message to the frontend alert instead of a hard-coded string
        const errorMessage = error.message || "Transaction failed. Cart has not been cleared.";
        res.status(400).json({ error: errorMessage });
    } finally {
        connection.release();
    }
});

module.exports = router;