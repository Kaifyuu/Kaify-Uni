const db = require('../db');

async function processCheckout(userId, items, email, cardNumber, shippingMethod) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const itemIds = items.map(item => item.id);

        // Lock the rows and get the live stock
        const [dbProducts] = await connection.query(`SELECT id, price, stock FROM products WHERE id IN (?) FOR UPDATE`, [itemIds]);

        const trueData = {};
        dbProducts.forEach(p => {
            trueData[p.id] = { price: parseFloat(p.price), stock: parseInt(p.stock) };
        });

        let serverTotal = 0;
        for (const item of items) {
            const dbItem = trueData[item.id];
            if (!dbItem) throw new Error(`Product ${item.id} not found.`);

            // Block overselling before the DB crashes
            if (dbItem.stock < item.quantity) {
                throw new Error(`Out of stock: Only ${dbItem.stock} left for item ID ${item.id}.`);
            }

            serverTotal += (dbItem.price * item.quantity);
            item.price = dbItem.price;
        }
        serverTotal += parseFloat(shippingMethod);

        const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const itemsJson = JSON.stringify(items); 

        // 1. Insert Parent Order 
        const [orderResult] = await connection.query(
            'INSERT INTO orders (userId, date, total, items, statusStep, statusText) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, date, serverTotal.toFixed(2), itemsJson, 1, "Placed"]
        );
        const newOrderId = orderResult.insertId;

        // 2. Insert Child Items
        const orderItemEntries = items.map(item => [newOrderId, item.id, item.quantity, item.price]);
        await connection.query(
            'INSERT INTO order_items (orderId, productId, quantity, price) VALUES ?',
            [orderItemEntries]
        );

        // 3. Safely Decrement Product Stock
        for (const item of items) {
            await connection.query(
                'UPDATE products SET stock = stock - ? WHERE id = ?',
                [item.quantity, item.id]
            );
        }

        await connection.commit();
        return { message: "Order placed successfully!", orderTotal: serverTotal.toFixed(2) };

    } catch (error) {
        await connection.rollback();
        throw error; // Rethrow to let the controller handle it
    } finally {
        connection.release();
    }
}

module.exports = {
    processCheckout
};
