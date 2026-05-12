const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
    try {
        const category = req.query.category;
        const sortById = req.query.sortById === 'true';
        
        let query = 'SELECT * FROM products';
        let params = [];
        
        if (category) {
            query += ' WHERE category = ?';
            params.push(category);
        }

        if (sortById) {
            // Use CAST to ensure numerical sorting even though ID is VARCHAR
            query += ' ORDER BY CAST(id AS UNSIGNED) ASC';
        }
        
        const [rows] = await db.query(query, params);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Products Error:", error);
        res.status(500).json({ error: "Internal Server Error while fetching products" });
    }
});

// CREATE Product
router.post('/', async (req, res) => {
    try {
        const { id, name, category, price, stock, description, rating, imageUrl } = req.body;
        await db.query(
            'INSERT INTO products (id, name, category, price, stock, description, rating, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [id, name, category, price, stock, description, rating, imageUrl]
        );
        res.status(201).json({ message: "Product created successfully" });
    } catch (error) {
        console.error("Create Product Error:", error);
        res.status(500).json({ error: "Failed to create product" });
    }
});

// UPDATE Product (Full Edit)
router.put('/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const { name, category, price, stock, description, rating, imageUrl, newId } = req.body;
        
        // If the ID itself changed, we need to handle that. 
        // Note: This might be risky if there are foreign key constraints without CASCADE.
        if (newId && newId !== productId) {
            await db.query(
                'UPDATE products SET id = ?, name = ?, category = ?, price = ?, stock = ?, description = ?, rating = ?, imageUrl = ? WHERE id = ?',
                [newId, name, category, price, stock, description, rating, imageUrl, productId]
            );
        } else {
            await db.query(
                'UPDATE products SET name = ?, category = ?, price = ?, stock = ?, description = ?, rating = ?, imageUrl = ? WHERE id = ?',
                [name, category, price, stock, description, rating, imageUrl, productId]
            );
        }
        res.json({ message: 'Product updated successfully' });
    } catch (err) {
        console.error("Update Product Error:", err);
        res.status(500).json({ error: "Failed to update product" });
    }
});

// DELETE Product
router.delete('/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        await db.query('DELETE FROM products WHERE id = ?', [productId]);
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.error("Delete Product Error:", err);
        res.status(500).json({ error: "Failed to delete product" });
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