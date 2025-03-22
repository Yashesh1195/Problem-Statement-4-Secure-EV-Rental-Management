// KYC Submission functionality

// Handle KYC form submission
function handleKycSubmission(event) {
    event.preventDefault();

    // Check if user is logged in
    const userId = localStorage.getItem('userId');
    if (!userId) {
        showError('Please login to submit KYC');
        return;
    }

    // Get form data
    const kycData = {
        // Personal Details
        dob: document.getElementById('dob').value,
        gender: document.getElementById('gender').value,
        address: document.getElementById('address').value,

        // ID Proof
        idType: document.getElementById('idType').value,
        idNumber: document.getElementById('idNumber').value,
        idFront: document.getElementById('idFront').files[0],
        idBack: document.getElementById('idBack').files[0],

        // Driver's License
        licenseNumber: document.getElementById('licenseNumber').value,
        licenseExpiry: document.getElementById('licenseExpiry').value,
        licenseFront: document.getElementById('licenseFront').files[0],
        licenseBack: document.getElementById('licenseBack').files[0],

        // Selfie
        selfie: document.getElementById('selfie').files[0]
    };

    // Validate form data
    if (!validateKycData(kycData)) {
        return;
    }

    // Convert images to base64 and submit
    convertImagesToBase64(kycData)
        .then(processedData => submitKyc(processedData))
        .catch(error => showError('Error processing images: ' + error));
}

// Validate KYC data
function validateKycData(data) {
    // Check required fields
    if (!data.dob || !data.gender || !data.address) {
        showError('Please fill in all personal details');
        return false;
    }

    if (!data.idType || !data.idNumber || !data.idFront || !data.idBack) {
        showError('Please provide all ID proof details');
        return false;
    }

    if (!data.licenseNumber || !data.licenseExpiry || !data.licenseFront || !data.licenseBack) {
        showError('Please provide all driver\'s license details');
        return false;
    }

    if (!data.selfie) {
        showError('Please provide a selfie for verification');
        return false;
    }

    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/png'];
    const files = [data.idFront, data.idBack, data.licenseFront, data.licenseBack, data.selfie];
    
    for (const file of files) {
        if (!allowedTypes.includes(file.type)) {
            showError('Please upload only JPG or PNG images');
            return false;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            showError('Image size should not exceed 5MB');
            return false;
        }
    }

    return true;
}

// Convert images to base64
async function convertImagesToBase64(data) {
    const imageFields = ['idFront', 'idBack', 'licenseFront', 'licenseBack', 'selfie'];
    const processedData = { ...data };

    for (const field of imageFields) {
        if (data[field]) {
            processedData[field] = await readFileAsBase64(data[field]);
        }
    }

    return processedData;
}

// Read file as base64
function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

// Submit KYC data
async function submitKyc(data) {
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');

    // Prepare KYC request data
    const kycRequest = {
        ...data,
        userId,
        userName,
        status: 'pending',
        submittedAt: new Date().toISOString()
    };

    try {
        // Get existing KYC requests
        const kycRequests = JSON.parse(localStorage.getItem('kycRequests') || '{}');
        
        // Add new request
        kycRequests[userId] = kycRequest;
        
        // Save to localStorage
        localStorage.setItem('kycRequests', JSON.stringify(kycRequests));

        // Update user's KYC status
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        if (users[userId]) {
            users[userId].kycStatus = 'pending';
            users[userId].kycLastUpdated = new Date().toISOString();
            localStorage.setItem('users', JSON.stringify(users));
        }

        // Show success message
        showSuccess('KYC submitted successfully! Please wait for admin approval.');
        
        // Update UI
        updateKycStatus();
        
        // Reset form
        document.getElementById('kycForm').reset();
        
    } catch (error) {
        showError('Error submitting KYC: ' + error);
    }
}

// Update KYC status in profile
function updateKycStatus() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    const kycRequests = JSON.parse(localStorage.getItem('kycRequests') || '{}');
    const kycData = kycRequests[userId];

    const statusElement = document.getElementById('kycStatus');
    const formElement = document.getElementById('kycForm');
    const statusInfo = document.getElementById('kycStatusInfo');

    if (!kycData) {
        statusElement.innerHTML = '<span class="badge bg-secondary">Not Submitted</span>';
        formElement.style.display = 'block';
        statusInfo.style.display = 'none';
        return;
    }

    // Update status badge
    const statusColors = {
        pending: 'warning',
        approved: 'success',
        rejected: 'danger'
    };
    
    statusElement.innerHTML = `
        <span class="badge bg-${statusColors[kycData.status]}">
            ${kycData.status.toUpperCase()}
        </span>
    `;

    // Update status info
    statusInfo.innerHTML = `
        <div class="alert alert-${statusColors[kycData.status]} mt-3">
            <h5>KYC ${kycData.status.toUpperCase()}</h5>
            <p>
                <strong>Submitted:</strong> ${new Date(kycData.submittedAt).toLocaleString()}<br>
                ${kycData.approvedAt ? `<strong>Approved:</strong> ${new Date(kycData.approvedAt).toLocaleString()}<br>` : ''}
                ${kycData.rejectedAt ? `
                    <strong>Rejected:</strong> ${new Date(kycData.rejectedAt).toLocaleString()}<br>
                    <strong>Reason:</strong> ${kycData.rejectionReason}<br>
                ` : ''}
            </p>
        </div>
    `;
    statusInfo.style.display = 'block';

    // Show/hide form based on status
    formElement.style.display = kycData.status === 'rejected' ? 'block' : 'none';
}

// Show success message
function showSuccess(message) {
    const alert = document.getElementById('successAlert');
    if (alert) {
        alert.textContent = message;
        alert.style.display = 'block';
        setTimeout(() => alert.style.display = 'none', 5000);
    }
}

// Show error message
function showError(message) {
    const alert = document.getElementById('errorAlert');
    if (alert) {
        alert.textContent = message;
        alert.style.display = 'block';
        setTimeout(() => alert.style.display = 'none', 5000);
    }
}

// Initialize KYC submission when document is ready
document.addEventListener('DOMContentLoaded', function() {
    const kycForm = document.getElementById('kycForm');
    if (kycForm) {
        kycForm.addEventListener('submit', handleKycSubmission);
        updateKycStatus();
    }

    // Add file input preview functionality
    const imageInputs = ['idFront', 'idBack', 'licenseFront', 'licenseBack', 'selfie'];
    imageInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('change', function() {
                const preview = document.getElementById(`${inputId}Preview`);
                if (preview && this.files && this.files[0]) {
                    const reader = new FileReader();
                    reader.onload = e => preview.src = e.target.result;
                    reader.readAsDataURL(this.files[0]);
                }
            });
        }
    });
}); 