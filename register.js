// register.js
// Handles frontend registration logic and security validation before hitting the API

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent page refresh
            
            // 1. Gather input values from the UI
            const name = document.getElementById('regName').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;

            // 2. Frontend Security Validation (Layer 1 Defense)
            // Validates password complexity before sending data to the server
            
            // Check for minimum length of 8 characters
            if (password.length < 8) {
                return alert("Password must be at least 8 characters long.");
            }
            // Check for at least one uppercase letter using regex
            if (!/[A-Z]/.test(password)) {
                return alert("Password must contain at least one uppercase letter.");
            }
            // Check for at least one special character using regex
            if (!/[!@#$%^&*]/.test(password)) {
                return alert("Password must contain at least one special character (!@#$%^&*).");
            }

            // 3. API Communication
            // Send the validated data to the backend Gatekeeper
            try {
                // API_URL is defined globally in index.html
                const res = await fetch(`${API_URL}api/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });
                
                const data = await res.json();
                
                // 4. Handle Server Responses
                if (!res.ok) {
                    // Handle 409 Conflict if email already exists in the database
                    return alert(`Registration failed: ${data.error}`);
                }
                
                // Success: 201 Created
                alert("Registration successful! Please switch to the Login tab.");
                registerForm.reset(); // Clear the form for security
                
            } catch (err) {
                console.error(err);
                alert('Server connection failed.');
            }
        });
    }
});
