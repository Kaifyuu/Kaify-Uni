const express = require('express');
const router = express.Router();
// IMPORTANT: Make sure this path correctly points to your database connection file!
// If your db file is named db.js and is in the backend folder, this path is correct.
const db = require('../db');

// The Route: GET /api/products
router.get('/', async (req, res) => {
    try {
        const category = req.query.category;
        
        let query = 'SELECT * FROM products';
        let params = [];
        
        // Handle the weekend work requirement: Accept a query parameter for 'category'
        if (category) {
            query += ' WHERE category = ?';
            params.push(category);
        }
        
        const [rows] = await db.query(query, params);
        
        // Return the fetched data as a JSON response
        res.status(200).json(rows);
    } catch (error) {
        console.error("Products Error:", error);
        res.status(500).json({ error: "Internal Server Error while fetching products" });
    }
});

router.get('/:id/recommendations', async (req, res) => {
    try {
        const targetProductId = Number(req.params.id);
        if (!Number.isInteger(targetProductId) || targetProductId <= 0) {
            return res.status(400).json({ error: "Invalid product ID" });
        }

        // 1. Fetch all orders (In a massive enterprise app, you'd filter this, but it's perfect for our scale)
        const [orders] = await db.query('SELECT items FROM orders');

        let relatedProductCounts = {};

        // 2. The Collaborative Filtering Math
        orders.forEach(order => {
            // Parse the JSON items string back into a JavaScript array
            const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
            if (!Array.isArray(items)) {
                return;
            }
            
            // Did this order contain the product the user is currently looking at?
            const hasTarget = items.some(item => parseInt(item.id) === targetProductId);

            if (hasTarget) {
                // If yes, tally up all the OTHER items in this cart
                items.forEach(item => {
                    const itemId = parseInt(item.id);
                    if (itemId !== targetProductId) {
                        // Add 1 to the count for this product ID
                        relatedProductCounts[itemId] = (relatedProductCounts[itemId] || 0) + 1;
                    }
                });
            }
        });

        // 3. Sort the results to find the most popular companions
        const sortedIds = Object.keys(relatedProductCounts)
            .sort((a, b) => relatedProductCounts[b] - relatedProductCounts[a])
            .slice(0, 3); // Get the Top 3

        if (sortedIds.length === 0) {
            return res.status(200).json([]); // No recommendations found
        }

        // 4. Fetch the actual product details for these top IDs to send to the frontend
        const placeholders = sortedIds.map(() => '?').join(',');
        const [recommendedProducts] = await db.query(
            `SELECT * FROM products WHERE id IN (${placeholders})`,
            sortedIds
        );

        res.status(200).json(recommendedProducts);

    } catch (error) {
        console.error("Recommendation Error:", error);
        res.status(500).json({ error: "Internal Server Error while fetching recommendations" });
    }
});

module.exports = router;