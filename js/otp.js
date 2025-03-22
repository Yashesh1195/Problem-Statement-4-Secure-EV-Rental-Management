// OTP handling functions
let generatedOTP = null;
let verificationInProgress = false;
let registrationData = null;

function generateOTP() {
    // Generate a 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000);
}

function sendOTP(email) {
    // In a real application, this would make an API call to send OTP via email
    // For demo, we'll simulate it
    generatedOTP = generateOTP();
    console.log('OTP generated:', generatedOTP); // For testing purposes
    
    // Show the OTP verification section
    document.getElementById('registrationForm').style.display = 'none';
    document.getElementById('otpVerification').style.display = 'block';
    
    // Show success message
    alert(`OTP has been sent to ${email}\nFor demo purposes, OTP is: ${generatedOTP}`);
}

function startRegistration(event) {
    event.preventDefault();
    
    // Get form data
    const form = document.getElementById('registrationForm');
    registrationData = {
        firstName: form.querySelector('#firstName').value,
        lastName: form.querySelector('#lastName').value,
        email: form.querySelector('#email').value,
        phone: form.querySelector('#phone').value,
        password: form.querySelector('#password').value
    };

    // Validate form data
    if (!registrationData.email || !registrationData.password) {
        alert('Please fill in all required fields');
        return;
    }

    // Send OTP
    verificationInProgress = true;
    sendOTP(registrationData.email);
}

function verifyOTP(event) {
    event.preventDefault();
    
    const enteredOTP = document.getElementById('otpInput').value;
    
    if (enteredOTP == generatedOTP) { // Using == instead of === for string/number comparison
        // OTP is correct, complete registration
        completeRegistration();
    } else {
        alert('Invalid OTP. Please try again.');
    }
}

function completeRegistration() {
    // In a real application, this would make an API call to create the user account
    // For demo, we'll simulate successful registration
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', registrationData.firstName);
    
    // Show success message and redirect
    alert('Registration successful! Welcome to EV Rentals!');
    window.location.href = 'index.html';
}

function resendOTP() {
    if (registrationData && registrationData.email) {
        sendOTP(registrationData.email);
    }
}

// Initialize event listeners when document is loaded
document.addEventListener('DOMContentLoaded', function() {
    const registrationForm = document.getElementById('registrationForm');
    const otpForm = document.getElementById('otpForm');
    const resendButton = document.getElementById('resendOTP');

    if (registrationForm) {
        registrationForm.addEventListener('submit', startRegistration);
    }

    if (otpForm) {
        otpForm.addEventListener('submit', verifyOTP);
    }

    if (resendButton) {
        resendButton.addEventListener('click', resendOTP);
    }
}); 