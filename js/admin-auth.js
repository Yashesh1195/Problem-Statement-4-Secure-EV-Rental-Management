// Admin authentication functionality
document.addEventListener('DOMContentLoaded', function() {
    const adminLoginForm = document.getElementById('adminLoginForm');
    const adminRegisterForm = document.getElementById('adminRegisterForm');

    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', handleAdminLogin);
    }

    if (adminRegisterForm) {
        adminRegisterForm.addEventListener('submit', handleAdminRegistration);
    }

    // Check if already logged in
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        window.location.href = 'admin-dashboard.html';
    }
});

// Handle admin registration
function handleAdminRegistration(event) {
    event.preventDefault();

    const name = document.getElementById('adminName').value;
    const email = document.getElementById('adminEmail').value;
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    const confirmPassword = document.getElementById('adminConfirmPassword').value;
    const registrationCode = document.getElementById('registrationCode').value;

    // Validate registration code
    if (registrationCode !== 'EV_ADMIN_2025') { // This should be stored securely in production
        showError('Invalid registration code');
        return;
    }

    // Validate password
    if (!validatePassword(password)) {
        showError('Password does not meet requirements');
        return;
    }

    // Check password match
    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }

    // Check if username already exists
    const admins = JSON.parse(localStorage.getItem('admins') || '{}');
    if (admins[username]) {
        showError('Username already exists');
        return;
    }

    // Create admin account
    admins[username] = {
        name,
        email,
        username,
        password: hashPassword(password), // In production, use proper password hashing
        createdAt: new Date().toISOString(),
        role: 'admin'
    };

    // Save admin data
    localStorage.setItem('admins', JSON.stringify(admins));

    // Show success message and redirect
    showSuccess('Registration successful! Redirecting to login...');
    setTimeout(() => {
        window.location.href = 'admin-login.html';
    }, 2000);
}

// Handle admin login
function handleAdminLogin(event) {
    event.preventDefault();

    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;

    // Get admin data
    const admins = JSON.parse(localStorage.getItem('admins') || '{}');
    const admin = admins[username];

    // Validate credentials
    if (admin && admin.password === hashPassword(password)) {
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('adminUsername', username);
        localStorage.setItem('adminName', admin.name);
        localStorage.setItem('adminRole', admin.role);
        window.location.href = 'admin-dashboard.html';
    } else {
        showError('Invalid credentials. Please try again.');
    }
}

// Admin logout
function adminLogout() {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('adminName');
    localStorage.removeItem('adminRole');
    window.location.href = 'admin-login.html';
}

// Check admin authentication
function checkAdminAuth() {
    if (localStorage.getItem('adminLoggedIn') !== 'true') {
        window.location.href = 'admin-login.html';
        return false;
    }
    return true;
}

// Password validation
function validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return password.length >= minLength && 
           hasUpperCase && 
           hasLowerCase && 
           hasNumbers && 
           hasSpecialChar;
}

// Simple password hashing (for demo purposes only)
function hashPassword(password) {
    // In production, use a proper password hashing library
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString();
}

// Show success message
function showSuccess(message) {
    const successAlert = document.getElementById('successAlert');
    if (successAlert) {
        successAlert.textContent = message;
        successAlert.style.display = 'block';
        setTimeout(() => {
            successAlert.style.display = 'none';
        }, 5000);
    }
}

// Show error message
function showError(message) {
    const errorAlert = document.getElementById('errorAlert');
    if (errorAlert) {
        errorAlert.textContent = message;
        errorAlert.style.display = 'block';
        setTimeout(() => {
            errorAlert.style.display = 'none';
        }, 5000);
    }
} 