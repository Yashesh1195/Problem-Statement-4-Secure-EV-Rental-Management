// Admin KYC functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check admin authentication
    if (!checkAdminAuth()) return;

    // Set admin name
    document.getElementById('adminName').textContent = localStorage.getItem('adminUsername');

    // Load KYC applications
    loadKycApplications();

    // Add event listeners
    document.getElementById('statusFilter').addEventListener('change', filterApplications);
    document.getElementById('searchInput').addEventListener('input', filterApplications);
});

// Load all KYC applications
function loadKycApplications() {
    const kycStorage = JSON.parse(localStorage.getItem('kycData') || '{}');
    const applications = [];

    // Get user data
    const userStorage = JSON.parse(localStorage.getItem('users') || '{}');

    // Convert storage to array and add user details
    for (const userId in kycStorage) {
        const kycData = kycStorage[userId];
        const user = userStorage[userId] || {};
        const status = localStorage.getItem(`kycStatus_${userId}`) || 'pending';

        applications.push({
            userId,
            userName: user.name || 'Unknown User',
            userEmail: user.email || 'No email',
            status,
            submittedAt: kycData.submittedAt,
            ...kycData
        });
    }

    // Sort by submission date (newest first)
    applications.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    // Update statistics
    updateKycStats(applications);

    // Display applications
    displayApplications(applications);
}

// Display KYC applications
function displayApplications(applications) {
    const container = document.getElementById('kycApplications');
    const statusFilter = document.getElementById('statusFilter').value;
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();

    // Filter applications
    const filteredApplications = applications.filter(app => {
        const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
        const matchesSearch = app.userName.toLowerCase().includes(searchQuery) ||
                            app.userId.toLowerCase().includes(searchQuery);
        return matchesStatus && matchesSearch;
    });

    // Generate HTML
    container.innerHTML = filteredApplications.map(app => `
        <div class="col-md-6 col-lg-4">
            <div class="card kyc-card">
                <div class="status-badge badge-${app.status}">${capitalizeFirst(app.status)}</div>
                <div class="card-body">
                    <h5 class="card-title">${app.userName}</h5>
                    <p class="card-text">
                        <small class="text-muted">ID: ${app.userId}</small><br>
                        <small class="text-muted">Submitted: ${new Date(app.submittedAt).toLocaleDateString()}</small>
                    </p>
                    <div class="mb-3">
                        <strong>ID Type:</strong> ${capitalizeFirst(app.idProof.type)}<br>
                        <strong>License Number:</strong> ${app.driverLicense.number}
                    </div>
                    <button class="btn btn-primary" onclick="viewKycDetails('${app.userId}')">
                        View Details
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Update KYC statistics
function updateKycStats(applications) {
    const stats = applications.reduce((acc, app) => {
        acc[app.status]++;
        return acc;
    }, { pending: 0, verified: 0, rejected: 0 });

    document.getElementById('pendingCount').textContent = stats.pending;
    document.getElementById('verifiedCount').textContent = stats.verified;
    document.getElementById('rejectedCount').textContent = stats.rejected;
}

// Filter applications
function filterApplications() {
    loadKycApplications();
}

// View KYC details
function viewKycDetails(userId) {
    const kycData = JSON.parse(localStorage.getItem('kycData') || '{}')[userId];
    const userData = JSON.parse(localStorage.getItem('users') || '{}')[userId];
    
    if (!kycData) {
        showError('KYC data not found');
        return;
    }

    // Set modal data
    document.getElementById('modalFullName').textContent = userData?.name || 'Unknown User';
    document.getElementById('modalDob').textContent = kycData.personalDetails.dob;
    document.getElementById('modalGender').textContent = capitalizeFirst(kycData.personalDetails.gender);
    document.getElementById('modalAddress').textContent = kycData.personalDetails.address;

    document.getElementById('modalIdType').textContent = capitalizeFirst(kycData.idProof.type);
    document.getElementById('modalIdNumber').textContent = kycData.idProof.number;
    document.getElementById('modalIdFront').src = kycData.idProof.frontImage;
    document.getElementById('modalIdBack').src = kycData.idProof.backImage;

    document.getElementById('modalLicenseNumber').textContent = kycData.driverLicense.number;
    document.getElementById('modalLicenseExpiry').textContent = kycData.driverLicense.expiryDate;
    document.getElementById('modalLicenseFront').src = kycData.driverLicense.frontImage;
    document.getElementById('modalLicenseBack').src = kycData.driverLicense.backImage;

    document.getElementById('modalSelfie').src = kycData.selfie;

    // Store userId for approval/rejection
    document.getElementById('kycModal').dataset.userId = userId;

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('kycModal'));
    modal.show();
}

// Show rejection reason input
function showRejectionReason() {
    const rejectionSection = document.getElementById('rejectionReasonSection');
    rejectionSection.style.display = 'block';
    document.getElementById('rejectionReason').focus();
}

// Approve KYC
function approveKyc() {
    const modal = document.getElementById('kycModal');
    const userId = modal.dataset.userId;

    // Update status
    localStorage.setItem(`kycStatus_${userId}`, 'verified');
    localStorage.setItem(`kycVerified_${userId}`, 'true');

    // Close modal
    bootstrap.Modal.getInstance(modal).hide();

    // Show success message
    showSuccess('KYC approved successfully');

    // Reload applications
    loadKycApplications();
}

// Reject KYC
function rejectKyc() {
    const modal = document.getElementById('kycModal');
    const userId = modal.dataset.userId;
    const reason = document.getElementById('rejectionReason').value.trim();

    if (!reason) {
        showError('Please provide a reason for rejection');
        return;
    }

    // Update status and store rejection reason
    localStorage.setItem(`kycStatus_${userId}`, 'rejected');
    localStorage.setItem(`kycVerified_${userId}`, 'false');
    localStorage.setItem(`kycRejectionReason_${userId}`, reason);

    // Close modal
    bootstrap.Modal.getInstance(modal).hide();

    // Show success message
    showSuccess('KYC rejected successfully');

    // Reload applications
    loadKycApplications();
}

// Helper functions
function capitalizeFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function showSuccess(message) {
    const alert = document.getElementById('successAlert');
    alert.textContent = message;
    alert.style.display = 'block';
    setTimeout(() => alert.style.display = 'none', 5000);
}

function showError(message) {
    const alert = document.getElementById('errorAlert');
    alert.textContent = message;
    alert.style.display = 'block';
    setTimeout(() => alert.style.display = 'none', 5000);
} 