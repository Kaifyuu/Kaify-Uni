const express = require('express');
const router = express.Router();
const db = require('../db'); // <-- Import the database connection!

router.post('/', async (req, res) => {
    try {
        // 1. Unpack the body data (now including userId)
        const { userId, items, email, cardNumber, shippingMethod } = req.body;

        // 2. SERVER-SIDE VALIDATION (The Gatekeeper)
        if (!items || items.length === 0) {
            return res.status(400).json({ error: "Transaction Failed: Cart is empty." });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            return res.status(400).json({ error: "Transaction Failed: Invalid email format." });
        }

        const ccRegex = /^\d{16}$/;
        if (!cardNumber || !ccRegex.test(cardNumber)) {
            return res.status(400).json({ error: "Transaction Failed: Credit card must be exactly 16 digits." });
        }
        
        // 3. SERVER-SIDE CALCULATION (The Gatekeeper)
        let serverTotal = 0;
        
        // Extract just the IDs from the incoming cart
        const itemIds = items.map(item => item.id);
        
        // Fetch the TRUE prices from the database
        const placeholders = itemIds.map(() => '?').join(',');
        const [dbProducts] = await db.query(
            `SELECT id, price FROM products WHERE id IN (${placeholders})`, 
            itemIds
        );
        
        // Create a lookup map for easy access: { "11": 220.00 }
        const truePrices = {};
        dbProducts.forEach(p => {
            truePrices[p.id] = parseFloat(p.price);
        });

        // Calculate using TRUE prices, NOT the frontend's requested prices
        for (const item of items) {
            const truePrice = truePrices[item.id];
            
            if (truePrice === undefined) {
                return res.status(400).json({ error: `Transaction Failed: Product ID ${item.id} does not exist.` });
            }
            
            serverTotal += (truePrice * item.quantity);
            // Overwrite the frontend price so the database receipt is accurate
            item.price = truePrice; 
        }
        
        serverTotal += parseFloat(shippingMethod);

        // 4. PERSISTENCE (Actual Database Insert)
        const date = new Date().toLocaleDateString();
        const statusStep = 1;
        const statusText = "Placed";

        // Write the order to the MySQL database
        await db.query(
            'INSERT INTO orders (userId, date, total, items, statusStep, statusText) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, date, serverTotal.toFixed(2), JSON.stringify(items), statusStep, statusText]
        );

        res.status(200).json({ 
            message: "Order placed successfully!", 
            orderTotal: serverTotal.toFixed(2)
        });

    } catch (error) {
        console.error("Checkout Error:", error);
        res.status(400).json({ error: "Server processing error. Your cart has not been cleared." });
    }
});

module.exports = router;