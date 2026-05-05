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
        console.error("Error fetching products from MySQL:", error);
        res.status(500).json({ error: "Internal Server Error while fetching products" });
    }
});

module.exports = router;