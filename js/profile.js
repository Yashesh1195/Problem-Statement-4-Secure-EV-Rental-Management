// Load profile data when the page loads
document.addEventListener('DOMContentLoaded', function() {
    loadProfileData();
    loadProfileStats();

    // Personal Information form
    const personalInfoForm = document.querySelector('#personal-info form');
    if (personalInfoForm) {
        personalInfoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Handle personal info update
            updateProfile(e);
        });
    }

    // KYC form
    const kycForm = document.querySelector('#kyc-verification form');
    if (kycForm) {
        kycForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Handle KYC submission
            alert('KYC documents submitted successfully!');
        });
    }

    // Payment method form
    const paymentForm = document.querySelector('#payment-methods form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Handle payment method addition
            alert('Payment method added successfully!');
        });
    }

    // Preferences form
    const preferencesForm = document.querySelector('#preferences form');
    if (preferencesForm) {
        preferencesForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Handle preferences update
            alert('Preferences saved successfully!');
        });
    }
});

// Load user profile data
function loadProfileData() {
    // Get user data from localStorage
    const userName = localStorage.getItem('userName') || 'Not set';
    const userEmail = localStorage.getItem('userEmail') || 'Not set';
    const userId = localStorage.getItem('userId') || '';
    const registrationDate = new Date(parseInt(userId.split('_')[1])).toLocaleDateString();
    
    // Get profile data
    const profileData = JSON.parse(localStorage.getItem('profileData') || '{}');
    
    // Update header information
    document.getElementById('userName').textContent = userName;
    document.getElementById('userEmail').textContent = userEmail;
    document.getElementById('userId').textContent = `Member since: ${registrationDate}`;
    
    // Update form fields if data exists
    document.getElementById('fullName').value = profileData.fullName || '';
    document.getElementById('phone').value = profileData.phone || '';
    document.getElementById('address').value = profileData.address || '';
    document.getElementById('licenseNumber').value = profileData.licenseNumber || '';
    document.getElementById('licenseExpiry').value = profileData.licenseExpiry || '';
    document.getElementById('emergencyName').value = profileData.emergencyName || '';
    document.getElementById('emergencyPhone').value = profileData.emergencyPhone || '';
}

// Load user statistics
function loadProfileStats() {
    // Get bookings from localStorage
    const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    const now = new Date();
    
    // Calculate statistics
    const totalBookings = bookings.length;
    const activeBookings = bookings.filter(booking => 
        new Date(booking.endDate) >= now && booking.status !== 'cancelled'
    ).length;
    
    // Get reviews (if implemented)
    const reviews = JSON.parse(localStorage.getItem('userReviews') || '[]');
    const totalReviews = reviews.length;
    
    // Update statistics display
    document.getElementById('totalBookings').textContent = totalBookings;
    document.getElementById('activeBookings').textContent = activeBookings;
    document.getElementById('totalReviews').textContent = totalReviews;
}

// Handle profile update
function updateProfile(event) {
    event.preventDefault();
    
    // Get form data
    const profileData = {
        fullName: document.getElementById('fullName').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        licenseNumber: document.getElementById('licenseNumber').value,
        licenseExpiry: document.getElementById('licenseExpiry').value,
        emergencyName: document.getElementById('emergencyName').value,
        emergencyPhone: document.getElementById('emergencyPhone').value,
        updatedAt: new Date().toISOString()
    };
    
    // Validate phone numbers
    if (!isValidPhoneNumber(profileData.phone)) {
        showError('Please enter a valid phone number');
        return;
    }
    if (!isValidPhoneNumber(profileData.emergencyPhone)) {
        showError('Please enter a valid emergency contact number');
        return;
    }
    
    // Validate license expiry
    if (!isValidLicenseExpiry(profileData.licenseExpiry)) {
        showError('License expiry date must be in the future');
        return;
    }
    
    // Save to localStorage
    localStorage.setItem('profileData', JSON.stringify(profileData));
    
    // Update display
    showSuccess('Profile updated successfully');
}

// Handle password change
function changePassword(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate passwords
    if (!currentPassword || !newPassword || !confirmPassword) {
        showError('Please fill in all password fields');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showError('New passwords do not match');
        return;
    }
    
    // Validate password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
        showError(passwordValidation.errors[0]);
        return;
    }
    
    // In a real application, this would make an API call to verify the current password
    // and update with the new password
    
    // For demo purposes, just show success
    showSuccess('Password updated successfully');
    
    // Clear form
    document.getElementById('passwordForm').reset();
}

// Utility functions
function showError(message) {
    const errorAlert = document.getElementById('errorAlert');
    errorAlert.textContent = message;
    errorAlert.style.display = 'block';
    
    setTimeout(() => {
        errorAlert.style.display = 'none';
    }, 5000);
}

function showSuccess(message) {
    const successAlert = document.getElementById('successAlert');
    successAlert.textContent = message;
    successAlert.style.display = 'block';
    
    setTimeout(() => {
        successAlert.style.display = 'none';
    }, 5000);
}

function isValidPhoneNumber(phone) {
    return /^\d{10}$/.test(phone);
}

function isValidLicenseExpiry(date) {
    const expiryDate = new Date(date);
    const today = new Date();
    return expiryDate > today;
} 