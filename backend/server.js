const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors()); // Allows your frontend index.html to fetch from this API
app.use(express.json());

// Initialize MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'ecommerce_db'
});

db.connect(err => {
    if (err) console.error('Database connection failed:', err);
    else console.log('Connected successfully to MySQL Database.');
});

// The single endpoint to serve our catalog
app.get('/api/products', (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Format decimal values from MySQL back into numbers for the frontend math
        const formattedResults = results.map(p => ({
            ...p, 
            price: parseFloat(p.price), 
            rating: parseFloat(p.rating)
        }));
        
        res.json(formattedResults);
    });
});
// Fetch order history
app.get('/api/orders', (req, res) => {
    db.query('SELECT * FROM orders ORDER BY id DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Save a new order
app.post('/api/orders', (req, res) => {
    const { date, total, items, statusStep, statusText } = req.body;
    
    // Convert the items array into a JSON string for MySQL
    const itemsJson = JSON.stringify(items);
    
    const query = 'INSERT INTO orders (date, total, items, statusStep, statusText) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [date, total, itemsJson, statusStep, statusText], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Order saved successfully', orderId: results.insertId });
    });
});

app.listen(3000, () => console.log('Store Server running on http://localhost:3000'));