router.get('/:id/recommendations', async (req, res) => {
    try {
        const targetId = parseInt(req.params.id);

        // Professional SQL Join Logic (Mini Project Requirement)
        const query = `
            SELECT p.*, COUNT(oi2.productId) as frequency
            FROM order_items oi1
            JOIN order_items oi2 ON oi1.orderId = oi2.orderId
            JOIN products p ON oi2.productId = p.id
            WHERE oi1.productId = ?      -- Find orders containing the current item
            AND oi2.productId <> ?       -- Don't recommend the item itself
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