// cart.js
// Handles shopping cart state, persistence with localStorage, and UI updates

let cartState = JSON.parse(localStorage.getItem('shopping_cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
    if (typeof updateCartDisplay === 'function') updateCartDisplay();

    // Event Delegation
    document.addEventListener('click', (e) => {
        const target = e.target.closest('.add-to-cart');
        
        if (target) {
            const productId = target.getAttribute('data-id');
            const productName = target.getAttribute('data-name') || `Product ${productId}`;
            const productPrice = parseFloat(target.getAttribute('data-price')) || 0;
            // GRAB THE STOCK DATA
            const productStock = parseInt(target.getAttribute('data-stock')) || 0; 
            
            addToCart(productId, productName, productPrice, productStock);
        }
    });
});

// Pass the stock variable into the function
function addToCart(id, name, price, stock) {
    const existingItem = cartState.find(item => item.id === id);

    if (existingItem) {
        // THE FIX: Check against the stock limit before incrementing!
        if (existingItem.quantity < stock) {
            existingItem.quantity += 1;
            console.log(`${name} quantity increased!`);
        } else {
            alert(`Sorry, we only have ${stock} of those in stock!`);
            return; // Stop execution, do not save to local storage
        }
    } else {
        if (stock > 0) {
            cartState.push({
                id: id,
                name: name,
                price: price,
                quantity: 1
            });
            console.log(`${name} added to cart!`);
        } else {
            alert(`Sorry, ${name} is completely out of stock!`);
            return;
        }
    }

    localStorage.setItem('shopping_cart', JSON.stringify(cartState));

    updateCartUI();
    if (typeof updateCartDisplay === 'function') updateCartDisplay();
}

function updateCartUI() {
    const cartCountElement = document.getElementById('cartCount'); 
    
    if (cartCountElement) {
        const totalItems = cartState.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.innerText = totalItems;
    }
}