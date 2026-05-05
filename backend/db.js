const mysql = require('mysql2/promise');

// Cloud-Ready MySQL Connection (Now with SSL bypass for Aiven!)
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ecommerce_db',
    port: process.env.DB_PORT || 3306,
    ssl: {
        rejectUnauthorized: false
    }
});

db.connect(err => {
    if (err) console.error('Database connection failed:', err);
    else console.log('Connected successfully to MySQL Database.');
});

module.exports = db;