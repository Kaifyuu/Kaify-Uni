const checkoutService = require('../services/checkoutService');

async function handleCheckout(req, res) {
    try {
        const { userId, items, email, cardNumber, shippingMethod } = req.body;

        if (!items || items.length === 0) return res.status(400).json({ error: "Cart is empty." });

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) return res.status(400).json({ error: "Invalid email." });

        const ccRegex = /^\d{16}$/;
        if (!cardNumber || !ccRegex.test(cardNumber)) return res.status(400).json({ error: "Invalid card format." });

        const result = await checkoutService.processCheckout(userId, items, email, cardNumber, shippingMethod);
        
        res.status(200).json(result);
    } catch (error) {
        console.error("\n=== CHECKOUT ERROR ===");
        console.error(error);
        const errorMessage = error.message || "Transaction failed. Cart has not been cleared.";
        res.status(400).json({ error: errorMessage });
    }
}

module.exports = {
    handleCheckout
};