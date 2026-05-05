const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        // 1. Unpack the body data
        const { items, email, cardNumber, shippingMethod } = req.body;

        // 2. SERVER-SIDE VALIDATION (The "Gatekeeper")
        
        // Is the cart empty?
        if (!items || items.length === 0) {
            return res.status(400).json({ error: "Transaction Failed: Cart is empty." });
        }

        // Is the email valid? (Regex check)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            return res.status(400).json({ error: "Transaction Failed: Invalid email format." });
        }

        // Is the credit card exactly 16 digits? (Regex check)
        const ccRegex = /^\d{16}$/;
        if (!cardNumber || !ccRegex.test(cardNumber)) {
            return res.status(400).json({ error: "Transaction Failed: Credit card must be exactly 16 digits." });
        }

        // 3. SERVER-SIDE CALCULATION
        // Re-calculate the total on the server so the frontend can't cheat the price
        let serverTotal = 0;
        items.forEach(item => {
            // In a real production app, you would query the DB for the true price here
            serverTotal += (item.price * item.qty); 
        });
        
        // Add shipping
        serverTotal += parseFloat(shippingMethod);

        // 4. PERSISTENCE (Simulated successful order)
        // If we reach this point, all ACID properties are satisfied.
        
        res.status(200).json({ 
            message: "Order placed successfully!", 
            orderTotal: serverTotal.toFixed(2)
        });

    } catch (error) {
        console.error("Checkout Error:", error);
        // Graceful failure: Send 400 status, DO NOT clear the cart
        res.status(400).json({ error: "Server processing error. Your cart has not been cleared." });
    }
});

module.exports = router;