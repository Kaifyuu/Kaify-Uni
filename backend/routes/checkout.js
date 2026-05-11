const express = require('express');
const router = express.Router();
const db = require('../db'); 

router.post('/', async (req, res) => {
    const connection = await db.getConnection(); 
    try {
        const { userId, items, email, cardNumber, shippingMethod } = req.body;

        if (!items || items.length === 0) return res.status(400).json({ error: "Cart is empty." });
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) return res.status(400).json({ error: "Invalid email." });

        const ccRegex = /^\d{16}$/;
        if (!cardNumber || !ccRegex.test(cardNumber)) return res.status(400).json({ error: "Invalid card format." });
        
        await connection.beginTransaction();

        const itemIds = items.map(item => item.id);
        
        // Lock the rows and get the live stock
        const [dbProducts] = await connection.query(`SELECT id, price, stock FROM products WHERE id IN (?) FOR UPDATE`, [itemIds]);
        
        const trueData = {};
        dbProducts.forEach(p => { 
            trueData[p.id] = { price: parseFloat(p.price), stock: parseInt(p.stock) }; 
        });

        let serverTotal = 0;
        for (const item of items) {
            const dbItem = trueData[item.id];
            if (!dbItem) throw new Error(`Product ${item.id} not found.`);
            
            // Block overselling before the DB crashes
            if (dbItem.stock < item.quantity) {
                throw new Error(`Out of stock: Only ${dbItem.stock} left for item ID ${item.id}.`);
            }

            serverTotal += (dbItem.price * item.quantity);
            item.price = dbItem.price; 
        }
        serverTotal += parseFloat(shippingMethod);

        const date = new Date().toISOString().slice(0, 19).replace('T', ' '); 
        const itemsJson = JSON.stringify(items); // <-- We need this for your frontend UI

        // 1. Insert Parent Order (Includes the items JSON string to prevent DB crashes)
        const [orderResult] = await connection.query(
            'INSERT INTO orders (userId, date, total, items, statusStep, statusText) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, date, serverTotal.toFixed(2), itemsJson, 1, "Placed"]
        );
        const newOrderId = orderResult.insertId;

        // 2. Insert Child Items
        const orderItemEntries = items.map(item => [newOrderId, item.id, item.quantity, item.price]);
        await connection.query(
            'INSERT INTO order_items (orderId, productId, quantity, price) VALUES ?',
            [orderItemEntries]
        );

        // 3. Safely Decrement Product Stock
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
        console.error("\n=== CHECKOUT CRASH ===");
        console.error(error);
        
        // Expose the TRUE error to the UI instead of the generic fallback
        const errorMessage = error.message || "Transaction failed. Cart has not been cleared.";
        res.status(400).json({ error: errorMessage });
    } finally {
        connection.release();
    }
});

module.exports = router;