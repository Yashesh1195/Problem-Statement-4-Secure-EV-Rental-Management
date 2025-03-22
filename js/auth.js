// Authentication state management
document.addEventListener('DOMContentLoaded', function() {
    checkAuthState();
});

// Check if user is logged in and handle page access
function checkAuthState() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const currentPage = window.location.pathname.split('/').pop();
    
    // Pages that require authentication
    const protectedPages = ['bookings.html', 'profile.html', 'reviews.html'];
    // Pages that should redirect to home if already logged in
    const authPages = ['login.html', 'register.html'];
    
    // If on a protected page and not logged in
    if (protectedPages.includes(currentPage) && !isLoggedIn) {
        // Store the attempted URL to redirect back after login
        sessionStorage.setItem('redirectUrl', window.location.href);
        window.location.href = 'login.html';
        return;
    }
    
    // If on auth pages and already logged in
    if (authPages.includes(currentPage) && isLoggedIn) {
        window.location.href = 'index.html';
        return;
    }
    
    // Update navigation based on auth state
    updateNavigation(isLoggedIn);
}

// Update navigation menu based on login state
function updateNavigation(isLoggedIn) {
    const authNav = document.querySelector('#navbarNav .navbar-nav:last-child');
    if (!authNav) return;
    
    if (isLoggedIn) {
        const userName = localStorage.getItem('userName') || 'User';
        authNav.innerHTML = `
            <li class="nav-item">
                <a class="nav-link" href="profile.html">
                    <i class="fas fa-user"></i> ${userName}
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#" onclick="logout(); return false;">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </a>
            </li>
        `;
    } else {
        authNav.innerHTML = `
            <li class="nav-item">
                <a class="nav-link" href="register.html">Register</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="login.html">Login</a>
            </li>
        `;
    }
}

// Handle login
function login(email, password) {
    // In a real application, this would make an API call to verify credentials
    // For demo purposes, we'll use a simple check
    if (email && password) {
        // Set login state
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userId', 'USER_' + Date.now());
        localStorage.setItem('userName', email.split('@')[0]);
        localStorage.setItem('userEmail', email);
        
        // Check if there's a redirect URL
        const redirectUrl = sessionStorage.getItem('redirectUrl');
        if (redirectUrl) {
            sessionStorage.removeItem('redirectUrl');
            window.location.href = redirectUrl;
        } else {
            window.location.href = 'index.html';
        }
    }
}

// Handle logout
function logout() {
    // Clear all auth-related data
    const itemsToKeep = ['userBookings']; // Keep booking history
    const itemsToRemove = [];
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!itemsToKeep.includes(key)) {
            itemsToRemove.push(key);
        }
    }
    
    itemsToRemove.forEach(key => localStorage.removeItem(key));
    
    // Redirect to home page
    window.location.href = 'index.html';
}

// Check if email exists (for registration)
function checkEmailExists(email) {
    // In a real application, this would check against a database
    // For demo purposes, always return false
    return false;
}

// Validate password strength
function validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
        isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
        errors: [
            password.length < minLength && 'Password must be at least 8 characters long',
            !hasUpperCase && 'Password must contain at least one uppercase letter',
            !hasLowerCase && 'Password must contain at least one lowercase letter',
            !hasNumbers && 'Password must contain at least one number',
            !hasSpecialChar && 'Password must contain at least one special character'
        ].filter(Boolean)
    };
} 