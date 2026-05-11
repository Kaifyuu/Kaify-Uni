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
        
        // --- CALCULATION (Using TRUE prices from DB) ---
        const itemIds = items.map(item => item.id);
        const [dbProducts] = await connection.query(`SELECT id, price FROM products WHERE id IN (?)`, [itemIds]);
        
        const truePrices = {};
        dbProducts.forEach(p => { truePrices[p.id] = parseFloat(p.price); });

        let serverTotal = 0;
        for (const item of items) {
            const truePrice = truePrices[item.id];
            if (truePrice === undefined) throw new Error(`Product ${item.id} not found.`);
            serverTotal += (truePrice * item.quantity);
            item.price = truePrice; 
        }
        serverTotal += parseFloat(shippingMethod);

        // --- ATOMIC PERSISTENCE (Session 7: All-or-Nothing) ---
        await connection.beginTransaction();

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

        await connection.commit();
        res.status(200).json({ message: "Order placed successfully!", orderTotal: serverTotal.toFixed(2) });

    } catch (error) {
        await connection.rollback();
        console.error("Checkout Error:", error);
        res.status(400).json({ error: "Transaction failed. Cart has not been cleared." });
    } finally {
        connection.release();
    }
});

module.exports = router;