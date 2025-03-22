// KYC functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check login status
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    // Initialize file upload previews
    initializeFileUploads();
    
    // Load KYC status
    loadKycStatus();
    
    // Add form submit handler
    const kycForm = document.getElementById('kycForm');
    if (kycForm) {
        kycForm.addEventListener('submit', handleKycSubmission);
    }

    // Add ID type validation
    const idTypeSelect = document.getElementById('idType');
    const idNumberInput = document.getElementById('idNumber');
    if (idTypeSelect && idNumberInput) {
        idTypeSelect.addEventListener('change', () => {
            updateIdValidation(idTypeSelect.value, idNumberInput);
        });
        idNumberInput.addEventListener('input', () => {
            validateIdNumber(idTypeSelect.value, idNumberInput.value);
        });
    }
});

// Initialize file upload previews
function initializeFileUploads() {
    const fileInputs = {
        'idProofFront': 'idProofFrontPreview',
        'idProofBack': 'idProofBackPreview',
        'licenseFront': 'licenseFrontPreview',
        'licenseBack': 'licenseBackPreview',
        'selfie': 'selfiePreview'
    };

    for (const [inputId, previewId] of Object.entries(fileInputs)) {
        const input = document.getElementById(inputId);
        const preview = document.getElementById(previewId);

        if (input && preview) {
            input.addEventListener('change', function(e) {
                handleFileUpload(e, preview);
            });

            // Click preview to trigger file input
            preview.addEventListener('click', () => input.click());
        }
    }
}

// Handle file upload and preview
function handleFileUpload(event, previewElement) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
        showError('Please upload an image file');
        return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showError('File size should be less than 5MB');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        previewElement.innerHTML = `
            <img src="${e.target.result}" alt="Document preview">
        `;
    };
    reader.readAsDataURL(file);
}

// Update ID validation based on type
function updateIdValidation(idType, inputElement) {
    switch (idType) {
        case 'aadhar':
            inputElement.pattern = '[0-9]{12}';
            inputElement.title = 'Please enter a valid 12-digit Aadhar number';
            break;
        case 'pan':
            inputElement.pattern = '[A-Z]{5}[0-9]{4}[A-Z]{1}';
            inputElement.title = 'Please enter a valid 10-character PAN number';
            break;
        case 'passport':
            inputElement.pattern = '[A-Z]{1}[0-9]{7}';
            inputElement.title = 'Please enter a valid 8-character Passport number';
            break;
        default:
            inputElement.pattern = '';
            inputElement.title = '';
    }
}

// Validate ID number format
function validateIdNumber(type, number) {
    let isValid = false;
    let message = '';

    switch (type) {
        case 'aadhar':
            isValid = /^[0-9]{12}$/.test(number);
            message = 'Aadhar number should be 12 digits';
            break;
        case 'pan':
            isValid = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(number);
            message = 'PAN number should be in format ABCDE1234F';
            break;
        case 'passport':
            isValid = /^[A-Z]{1}[0-9]{7}$/.test(number);
            message = 'Passport number should be in format A1234567';
            break;
        default:
            return true;
    }

    const idNumberInput = document.getElementById('idNumber');
    if (idNumberInput) {
        idNumberInput.setCustomValidity(isValid ? '' : message);
    }

    return isValid;
}

// Handle KYC form submission
async function handleKycSubmission(event) {
    event.preventDefault();

    // Get form data
    const formData = new FormData(event.target);
    const kycData = {
        personalDetails: {
            dob: formData.get('dob'),
            gender: formData.get('gender'),
            address: formData.get('address')
        },
        idProof: {
            type: formData.get('idType'),
            number: formData.get('idNumber'),
            frontImage: await getBase64(formData.get('idProofFront')),
            backImage: await getBase64(formData.get('idProofBack'))
        },
        driverLicense: {
            number: formData.get('licenseNumber'),
            expiryDate: formData.get('licenseExpiry'),
            frontImage: await getBase64(formData.get('licenseFront')),
            backImage: await getBase64(formData.get('licenseBack'))
        },
        selfie: await getBase64(formData.get('selfie')),
        submittedAt: new Date().toISOString()
    };

    // Save KYC data
    try {
        saveKycData(kycData);
        updateKycStatus('pending');
        showSuccess('KYC submitted successfully! We will verify your documents shortly.');
        
        // Disable form
        event.target.querySelectorAll('input, select, textarea, button').forEach(element => {
            element.disabled = true;
        });
    } catch (error) {
        showError('Failed to submit KYC. Please try again.');
        console.error('KYC submission error:', error);
    }
}

// Convert file to base64
function getBase64(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            resolve(null);
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Save KYC data to localStorage
function saveKycData(data) {
    const userId = localStorage.getItem('userId');
    if (!userId) throw new Error('User not found');

    const kycStorage = JSON.parse(localStorage.getItem('kycData') || '{}');
    kycStorage[userId] = data;
    localStorage.setItem('kycData', JSON.stringify(kycStorage));
}

// Load KYC status
function loadKycStatus() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    const kycStorage = JSON.parse(localStorage.getItem('kycData') || '{}');
    const kycData = kycStorage[userId];

    const kycStatus = document.getElementById('kycStatus');
    if (!kycStatus) return;

    if (!kycData) {
        kycStatus.textContent = 'Not Submitted';
        kycStatus.className = 'kyc-status status-pending';
        return;
    }

    const status = localStorage.getItem(`kycStatus_${userId}`) || 'pending';
    updateKycStatus(status);

    // Disable form if KYC is already submitted
    if (status !== 'rejected') {
        document.querySelectorAll('#kycForm input, #kycForm select, #kycForm textarea, #kycForm button').forEach(element => {
            element.disabled = true;
        });
    }
}

// Update KYC status
function updateKycStatus(status) {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    localStorage.setItem(`kycStatus_${userId}`, status);

    const kycStatus = document.getElementById('kycStatus');
    if (!kycStatus) return;

    switch (status) {
        case 'verified':
            kycStatus.textContent = 'Verified';
            kycStatus.className = 'kyc-status status-verified';
            localStorage.setItem('kycVerified', 'true');
            break;
        case 'rejected':
            kycStatus.textContent = 'Rejected';
            kycStatus.className = 'kyc-status status-rejected';
            localStorage.setItem('kycVerified', 'false');
            break;
        default:
            kycStatus.textContent = 'Pending Verification';
            kycStatus.className = 'kyc-status status-pending';
            localStorage.setItem('kycVerified', 'false');
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