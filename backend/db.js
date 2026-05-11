const mysql = require('mysql2/promise');
require('dotenv').config(); // Assuming you are using dotenv for your credentials

console.log(`Target Host: [${process.env.DB_HOST}]`);

// Create a connection pool instead of a single connection
// Pools handle disconnects and multiple requests much better in the cloud
const db = mysql.createPool({
    host: process.env.DB_HOST.trim(),
    user: process.env.DB_USER.trim(),
    password: process.env.DB_PASSWORD.trim(),
    database: process.env.DB_NAME.trim(),
    port: parseInt(process.env.DB_PORT) || 21117,
    ssl: { rejectUnauthorized: false }, 
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// If you want to test the connection on startup, we do it asynchronously now:
async function testConnection() {
    try {
        const connection = await db.getConnection();
        console.log('✅ Successfully connected to the Aiven MySQL database!');
        connection.release(); // Always release the connection back to the pool
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
    }
}

testConnection();

module.exports = db;