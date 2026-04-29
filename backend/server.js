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

app.listen(3000, () => console.log('Store Server running on http://localhost:3000'));