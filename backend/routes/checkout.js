router.post('/', async (req, res) => {
    const connection = await db.getConnection(); 
    try {
        const { userId, items, email, cardNumber, shippingMethod } = req.body;

        // Gatekeeper: Validate inputs and recalculate true prices (Session 7)
        // [Add your existing validation and price calculation logic here]

        await connection.beginTransaction();

        // Use ISO format for MySQL DATE compatibility (Session 10)
        const date = new Date().toISOString().slice(0, 10); 
        
        // 1. Insert Parent Order
        const [orderResult] = await connection.query(
            'INSERT INTO orders (userId, date, total, statusStep, statusText) VALUES (?, ?, ?, ?, ?)',
            [userId, date, serverTotal.toFixed(2), 1, "Placed"]
        );

        // 2. Insert Normalized Child Items (Session 8)
        const orderItemEntries = items.map(item => [orderResult.insertId, item.id, item.quantity, item.price]);
        await connection.query(
            'INSERT INTO order_items (orderId, productId, quantity, price) VALUES ?',
            [orderItemEntries]
        );

        await connection.commit();
        res.status(200).json({ message: "Order placed successfully!", orderTotal: serverTotal.toFixed(2) });

    } catch (error) {
        await connection.rollback();
        console.error("Checkout Error:", error);
        res.status(500).json({ error: "Failed to process order." });
    } finally {
        connection.release();
    }
});