const mysql = require('mysql2');

// 1. Connect to Aiven using Node.js (which natively supports modern encryption)
// Use environment variable for the database connection string
const connection = mysql.createConnection(process.env.DB_CONNECTION_URL);

// 2. The exact same SQL block from before
const setupSQL = `
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    password VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT,
    date VARCHAR(50),
    total DECIMAL(10, 2),
    items JSON,
    statusStep INT,
    statusText VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    rating DECIMAL(3, 1),
    stock INT DEFAULT 0,
    imageUrl VARCHAR(500),
    description TEXT
);

INSERT IGNORE INTO products (id, name, price, category, rating, stock, imageUrl, description) VALUES
('1', 'Digital E-Book: Web Dev', 19.99, 'Digital', 4.8, 150, 'https://placehold.co/400x300/dee2e6/6c757d?text=E-Book', 'A comprehensive guide to modern web development frameworks and best practices.'),
('2', 'Software License (1 Yr)', 49.00, 'Digital', 4.5, 500, 'https://placehold.co/400x300/dee2e6/6c757d?text=Software', 'A one-year premium license unlocking advanced productivity features and tools.'),
('3', 'Physical Merchandise T-Shirt', 25.00, 'Merchandise', 4.9, 45, 'https://placehold.co/400x300/dee2e6/6c757d?text=Apparel', 'A comfortable, 100% cotton t-shirt featuring our signature brand logo.'),
('4', 'Osu! Drawing Tablet', 35.50, 'Hardware', 4.7, 2, 'https://placehold.co/400x300/dee2e6/6c757d?text=Tablet', 'A highly responsive graphics tablet perfect for digital art and rhythm games.'),
('5', 'Maimai Arcade Gloves', 12.00, 'Merchandise', 4.6, 120, 'https://placehold.co/400x300/dee2e6/6c757d?text=Gloves', 'Breathable, low-friction gloves designed for competitive arcade rhythm gaming.'),
('6', 'Robux Gift Card (1000)', 10.00, 'Digital', 5.0, 999, 'https://placehold.co/400x300/dee2e6/6c757d?text=Gift+Card', 'A digital gift card instantly redeemable for 1000 premium in-game currency.'),
('7', 'Custom VTuber Asset Pack', 45.00, 'Digital', 4.9, 10, 'https://placehold.co/400x300/dee2e6/6c757d?text=Digital+Asset', 'A collection of high-quality digital assets to upgrade your virtual streaming persona.'),
('8', 'Anime Desk Mat', 28.99, 'Merchandise', 4.8, 35, 'https://placehold.co/400x300/dee2e6/6c757d?text=Desk+Mat', 'A wide, anti-slip desk mat featuring vibrant anime-inspired artwork.'),
('9', 'Mechanical Keyboard', 115.00, 'Hardware', 4.4, 22, 'https://placehold.co/400x300/dee2e6/6c757d?text=Keyboard', 'A tactile, RGB-backlit mechanical keyboard built for typing enthusiasts and gamers.'),
('10', 'Studio Condenser Mic', 140.00, 'Hardware', 4.7, 18, 'https://placehold.co/400x300/dee2e6/6c757d?text=Microphone', 'A professional-grade microphone ensuring crystal-clear vocal recordings for podcasts and streams.'),
('11', '144Hz Gaming Monitor', 220.00, 'Hardware', 4.6, 8, 'https://placehold.co/400x300/dee2e6/6c757d?text=Monitor', 'A stunning 1080p monitor delivering ultra-smooth visuals at a fast 144Hz refresh rate.'),
('12', 'RGB LED Strip Lights', 18.50, 'Hardware', 4.2, 4, 'https://placehold.co/400x300/dee2e6/6c757d?text=Lighting', 'Customizable LED strip lights to add dynamic, colorful ambiance to any room.'),
('13', 'Stream Deck Mini', 79.99, 'Hardware', 4.8, 15, 'https://placehold.co/400x300/dee2e6/6c757d?text=Stream+Deck', 'A compact control pad with customizable LCD keys for seamless livestream management.'),
('14', 'Noise Cancelling Headphones', 160.00, 'Hardware', 4.5, 28, 'https://placehold.co/400x300/dee2e6/6c757d?text=Headphones', 'Over-ear headphones offering immersive audio and active noise cancellation technology.'),
('15', 'USB Audio Interface', 110.00, 'Hardware', 4.7, 12, 'https://placehold.co/400x300/dee2e6/6c757d?text=Audio+IF', 'A high-fidelity audio interface for connecting studio microphones and instruments to your PC.'),
('16', 'Capture Card (1080p 60fps)', 125.00, 'Hardware', 4.6, 19, 'https://placehold.co/400x300/dee2e6/6c757d?text=Capture+Card', 'A reliable capture device for streaming and recording high-definition console gameplay.'),
('17', 'Ring Light with Tripod', 35.00, 'Hardware', 4.3, 1, 'https://placehold.co/400x300/dee2e6/6c757d?text=Ring+Light', 'An adjustable, dimmable ring light with a tripod perfect for illuminating face-cam setups.'),
('18', 'Anime Keycap Set', 40.00, 'Merchandise', 4.9, 40, 'https://placehold.co/400x300/dee2e6/6c757d?text=Keycaps', 'A stylish, durable set of custom keycaps featuring unique anime-themed designs.'),
('19', 'Ultralight Gaming Mouse', 65.00, 'Hardware', 4.8, 25, 'https://placehold.co/400x300/dee2e6/6c757d?text=Mouse', 'A precision gaming mouse with an ultra-lightweight honeycomb shell for fast, accurate flicks.'),
('20', '4K Web Camera', 130.00, 'Hardware', 4.4, 14, 'https://placehold.co/400x300/dee2e6/6c757d?text=Webcam', 'A high-resolution webcam delivering crisp 4K video for professional streams and calls.');
`;

console.log("Connecting to Aiven Cloud...");
connection.query(setupSQL, (err, results) => {
    if (err) {
        console.error("Error setting up database:", err.message);
    } else {
        console.log("Success! Tables created and 20 products seeded to Aiven Cloud.");
    }
    // Close the connection so the terminal process finishes
    connection.end(); 
});