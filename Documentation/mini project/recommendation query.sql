-- "Customers who bought this item also bought..."
-- Assuming a standard normalized Order_Items table for advanced JOIN demonstration

SELECT p.name, COUNT(*) as purchase_frequency
FROM orders o1
JOIN order_items oi1 ON o1.id = oi1.order_id
JOIN orders o2 ON o1.userId = o2.userId  -- Find all orders by users who bought the target item
JOIN order_items oi2 ON o2.id = oi2.order_id
JOIN products p ON oi2.product_id = p.id
WHERE oi1.product_id = ?                  -- The ID of the item currently being viewed
  AND oi2.product_id != ?                 -- Exclude the target item itself from the results
GROUP BY p.id, p.name
ORDER BY purchase_frequency DESC
LIMIT 5;