// Login form handling
function handleLogin(event) {
    event.preventDefault();
    
    // Get form elements
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Get alert elements
    const errorAlert = document.getElementById('errorAlert');
    const successAlert = document.getElementById('successAlert');
    
    // Hide any existing alerts
    errorAlert.style.display = 'none';
    successAlert.style.display = 'none';
    
    // Basic validation
    if (!email || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    // Email format validation
    if (!isValidEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    // Password validation
    if (password.length < 6) {
        showError('Password must be at least 6 characters long');
        return;
    }
    
    // In a real application, this would make an API call to verify credentials
    // For demo purposes, we'll use a simple check
    if (email && password) {
        // Show success message
        showSuccess('Login successful! Redirecting...');
        
        // If remember me is checked, store email
        if (rememberMe) {
            localStorage.setItem('rememberedEmail', email);
        } else {
            localStorage.removeItem('rememberedEmail');
        }
        
        // Perform login
        login(email, password);
    }
}

// Show error message
function showError(message) {
    const errorAlert = document.getElementById('errorAlert');
    errorAlert.textContent = message;
    errorAlert.style.display = 'block';
    
    // Hide error after 5 seconds
    setTimeout(() => {
        errorAlert.style.display = 'none';
    }, 5000);
}

// Show success message
function showSuccess(message) {
    const successAlert = document.getElementById('successAlert');
    successAlert.textContent = message;
    successAlert.style.display = 'block';
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Check for remembered email on page load
document.addEventListener('DOMContentLoaded', function() {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        document.getElementById('email').value = rememberedEmail;
        document.getElementById('rememberMe').checked = true;
    }
});

function socialLogin(provider) {
    // In a real application, this would integrate with social login providers
    alert(`${provider} login integration would be implemented here`);
} 