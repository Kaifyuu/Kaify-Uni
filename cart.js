// cart.js
// Handles shopping cart state, persistence with localStorage, and UI updates

// 1. The Hydration Lifecycle
// Check local storage for existing cart data on load. Default to an empty array if null.
// JSON.parse() acts as the Serialization Bridge, turning the stored string back into a live JS object.
let cartState = JSON.parse(localStorage.getItem('shopping_cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    // Sync the UI with the hydrated state immediately on load
    updateCartUI();
    if (typeof updateCartDisplay === 'function') updateCartDisplay();

    // 2. Event Delegation
    // Instead of attaching 100 listeners to 100 buttons, we attach ONE listener to the parent container.
    document.addEventListener('click', (e) => {
        // Check if the clicked element (or its parent) has the 'add-to-cart' class
        const target = e.target.closest('.add-to-cart');
        
        if (target) {
            // Grab the data attributes from the button
            const productId = target.getAttribute('data-id');
            const productName = target.getAttribute('data-name') || `Product ${productId}`;
            const productPrice = parseFloat(target.getAttribute('data-price')) || 0;
            
            addToCart(productId, productName, productPrice);
        }
    });
});

// 3. The "Add to Cart" Business Logic
function addToCart(id, name, price) {
    // The Decision Diamond: Does this ID already exist in the cart array?
    const existingItem = cartState.find(item => item.id === id);

    if (existingItem) {
        // If YES -> Increment quantity
        existingItem.quantity += 1;
    } else {
        // If NO -> Push new object to the array with quantity = 1
        cartState.push({
            id: id,
            name: name,
            price: price,
            quantity: 1
        });
    }

    // 4. Persistence
    // Save the updated state back to LocalStorage (turning the object into a String)
    localStorage.setItem('shopping_cart', JSON.stringify(cartState));

    // 5. Distributed UI Synchronization
    updateCartUI();
    if (typeof updateCartDisplay === 'function') updateCartDisplay();
    console.log(`${name} added to cart!`);
}

// 6. State Observer Pattern
// A single function to update all UI elements that depend on the cart state
function updateCartUI() {
    const cartCountElement = document.getElementById('cartCount'); // Assuming you have a badge with this ID
    
    if (cartCountElement) {
        // Calculate total items by summing up the quantities
        const totalItems = cartState.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.innerText = totalItems;
    }
}