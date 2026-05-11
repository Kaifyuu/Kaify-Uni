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

// backend/routes/products.js
// Replace your existing /:id/recommendations route with this:

router.get('/:id/recommendations', async (req, res) => {
    try {
        const targetId = parseInt(req.params.id);

        // SQL Logic: Find products frequently bought with the current item by other users
        const query = `
            SELECT p.*, COUNT(oi2.productId) as frequency
            FROM order_items oi1
            JOIN order_items oi2 ON oi1.orderId = oi2.orderId
            JOIN products p ON oi2.productId = p.id
            WHERE oi1.productId = ?      -- Orders containing the viewed item
            AND oi2.productId <> ?       -- Don't recommend the item itself
            GROUP BY oi2.productId
            ORDER BY frequency DESC
            LIMIT 3;
        `;

        const [recommendedProducts] = await db.query(query, [targetId, targetId]);
        res.status(200).json(recommendedProducts);

    } catch (error) {
        console.error("Recommendation SQL Error:", error);
        res.status(500).json({ error: "Failed to fetch recommendations." });
    }
});

module.exports = router;