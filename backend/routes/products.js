const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
    try {
        const category = req.query.category;
        
        let query = 'SELECT * FROM products';
        let params = [];
        
        if (category) {
            query += ' WHERE category = ?';
            params.push(category);
        }
        
        const [rows] = await db.query(query, params);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Products Error:", error);
        res.status(500).json({ error: "Internal Server Error while fetching products" });
    }
});

router.get('/:id/recommendations', async (req, res) => {
    try {
        const targetId = parseInt(req.params.id);

        const query = `
            SELECT p.*, COUNT(oi2.productId) as frequency
            FROM order_items oi1
            JOIN order_items oi2 ON oi1.orderId = oi2.orderId
            JOIN products p ON oi2.productId = p.id
            WHERE oi1.productId = ?      
            AND oi2.productId <> ?       
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