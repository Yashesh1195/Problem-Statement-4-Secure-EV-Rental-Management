// KYC Management functionality

// Global variable to store KYC requests
let cachedKycRequests = [];

// Debounce function to limit how often a function is called
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Load KYC requests in admin dashboard
function loadKycRequests() {
    if (!checkAdminAuth()) return;

    const kycRequests = JSON.parse(localStorage.getItem('kycRequests') || '{}');
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const requests = [];

    // Convert KYC data to array and add user details
    for (const userId in kycRequests) {
        const kyc = kycRequests[userId];
        const user = users[userId] || {};
        
        // Ensure status is properly set
        const status = kyc.status || 'pending';
        const statusInfo = {
            status,
            statusDate: kyc[`${status}At`] || kyc.submittedAt,
            statusBy: kyc[`${status}By`] || '',
            rejectionReason: kyc.rejectionReason || ''
        };

        requests.push({
            userId,
            userName: user.name || 'Unknown User',
            userEmail: user.email || 'No email',
            ...statusInfo,
            submittedAt: kyc.submittedAt,
            ...kyc
        });
    }

    // Sort by submission date (newest first)
    requests.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    
    // Cache the requests
    cachedKycRequests = requests;

    // Update KYC statistics
    updateKycStats(requests);

    // Display KYC requests with current filters
    filterAndDisplayRequests();
}

// Filter and display KYC requests
function filterAndDisplayRequests() {
    const container = document.getElementById('kycApplications');
    const statusFilter = document.getElementById('statusFilter')?.value || 'all';
    const searchQuery = document.getElementById('searchInput')?.value.toLowerCase() || '';

    // Filter requests
    const filteredRequests = cachedKycRequests.filter(req => {
        const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
        const matchesSearch = req.userName.toLowerCase().includes(searchQuery) ||
                            req.userId.toLowerCase().includes(searchQuery);
        return matchesStatus && matchesSearch;
    });

    // Generate HTML
    container.innerHTML = filteredRequests.map(req => `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card kyc-card h-100">
                <div class="card-header bg-${getStatusColor(req.status)}">
                    <h5 class="card-title mb-0 text-white">${req.userName}</h5>
                    <span class="badge bg-light text-dark status-badge">
                        ${req.status.toUpperCase()}
                    </span>
                </div>
                <div class="card-body">
                    <p class="card-text">
                        <strong>User ID:</strong> ${req.userId}<br>
                        <strong>Email:</strong> ${req.userEmail}<br>
                        <strong>Submitted:</strong> ${new Date(req.submittedAt).toLocaleString()}<br>
                        <strong>Status Updated:</strong> ${new Date(req.statusDate).toLocaleString()}<br>
                        ${req.status === 'rejected' ? `<strong>Reason:</strong> ${req.rejectionReason}<br>` : ''}
                        ${req.statusBy ? `<strong>By Admin:</strong> ${req.statusBy}<br>` : ''}
                    </p>
                    <div class="mt-3">
                        <button class="btn btn-primary" onclick="viewKycDetails('${req.userId}')">
                            View Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('') || '<div class="col-12"><p class="text-center">No KYC requests found</p></div>';
}

// View KYC details in modal
function viewKycDetails(userId) {
    const kycData = JSON.parse(localStorage.getItem('kycRequests') || '{}')[userId];
    const userData = JSON.parse(localStorage.getItem('users') || '{}')[userId];
    
    if (!kycData) {
        showError('KYC data not found');
        return;
    }

    // Populate modal with KYC details
    document.getElementById('kycModalLabel').textContent = `KYC Details - ${userData.name}`;
    
    const modalBody = document.getElementById('kycModalBody');
    modalBody.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <h5>Personal Information</h5>
                <p>
                    <strong>Name:</strong> ${userData.name}<br>
                    <strong>Email:</strong> ${userData.email}<br>
                    <strong>DOB:</strong> ${kycData.dob}<br>
                    <strong>Gender:</strong> ${kycData.gender}<br>
                    <strong>Address:</strong> ${kycData.address}
                </p>
            </div>
            <div class="col-md-6">
                <h5>ID Proof</h5>
                <p>
                    <strong>Type:</strong> ${kycData.idType}<br>
                    <strong>Number:</strong> ${kycData.idNumber}
                </p>
                <div class="mb-3">
                    <label class="form-label">ID Front</label><br>
                    <img src="${kycData.idFront}" class="img-preview">
                </div>
                <div class="mb-3">
                    <label class="form-label">ID Back</label><br>
                    <img src="${kycData.idBack}" class="img-preview">
                </div>
            </div>
        </div>
        <div class="row mt-3">
            <div class="col-md-6">
                <h5>Driver's License</h5>
                <p>
                    <strong>Number:</strong> ${kycData.licenseNumber}<br>
                    <strong>Expiry:</strong> ${kycData.licenseExpiry}
                </p>
                <div class="mb-3">
                    <label class="form-label">License Front</label><br>
                    <img src="${kycData.licenseFront}" class="img-preview">
                </div>
                <div class="mb-3">
                    <label class="form-label">License Back</label><br>
                    <img src="${kycData.licenseBack}" class="img-preview">
                </div>
            </div>
            <div class="col-md-6">
                <h5>Additional Information</h5>
                <div class="mb-3">
                    <label class="form-label">Selfie Verification</label><br>
                    <img src="${kycData.selfie}" class="img-preview">
                </div>
                <div class="kyc-status-info">
                    <h5>Status Information</h5>
                    <p>
                        <strong>Current Status:</strong> <span class="badge bg-${getStatusColor(kycData.status)}">${(kycData.status || 'pending').toUpperCase()}</span><br>
                        <strong>Submitted:</strong> ${new Date(kycData.submittedAt).toLocaleString()}<br>
                        ${kycData.approvedAt ? `<strong>Approved:</strong> ${new Date(kycData.approvedAt).toLocaleString()}<br>` : ''}
                        ${kycData.rejectedAt ? `<strong>Rejected:</strong> ${new Date(kycData.rejectedAt).toLocaleString()}<br>` : ''}
                        ${kycData.rejectionReason ? `<strong>Rejection Reason:</strong> ${kycData.rejectionReason}<br>` : ''}
                    </p>
                </div>
            </div>
        </div>
    `;

    // Update modal footer buttons based on current status
    const modalFooter = document.getElementById('kycModalFooter');
    modalFooter.innerHTML = `
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        ${kycData.status === 'pending' ? `
            <button type="button" class="btn btn-success" onclick="confirmApproval('${userId}')">Approve</button>
            <button type="button" class="btn btn-danger" onclick="showRejectForm('${userId}')">Reject</button>
        ` : ''}
        ${kycData.status === 'rejected' ? `
            <button type="button" class="btn btn-success" onclick="confirmApproval('${userId}')">Approve</button>
        ` : ''}
    `;

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('kycModal'));
    modal.show();
}

// Confirm approval
function confirmApproval(userId) {
    if (confirm('Are you sure you want to approve this KYC application?')) {
        approveKyc(userId);
    }
}

// Approve KYC request
function approveKyc(userId) {
    const kycRequests = JSON.parse(localStorage.getItem('kycRequests') || '{}');
    if (!kycRequests[userId]) {
        showError('KYC data not found');
        return;
    }

    const adminUsername = localStorage.getItem('adminUsername');
    if (!adminUsername) {
        showError('Admin session not found. Please login again.');
        return;
    }

    // Update KYC status
    kycRequests[userId] = {
        ...kycRequests[userId],
        status: 'approved',
        approvedAt: new Date().toISOString(),
        approvedBy: adminUsername,
        // Clear any previous rejection data
        rejectionReason: '',
        rejectedAt: null,
        rejectedBy: null
    };

    // Save updated KYC data
    localStorage.setItem('kycRequests', JSON.stringify(kycRequests));

    // Update user's KYC status
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[userId]) {
        users[userId].kycVerified = true;
        users[userId].kycStatus = 'approved';
        users[userId].kycLastUpdated = new Date().toISOString();
        localStorage.setItem('users', JSON.stringify(users));
    }

    // Close modal and refresh
    bootstrap.Modal.getInstance(document.getElementById('kycModal')).hide();
    showSuccess('KYC request approved successfully');
    loadKycRequests(); // Reload data and update display
}

// Show reject form
function showRejectForm(userId) {
    const modalBody = document.getElementById('kycModalBody');
    modalBody.innerHTML += `
        <div class="mt-3" id="rejectForm">
            <h5>Rejection Reason</h5>
            <div class="alert alert-warning">
                Please provide a detailed reason for rejection. This will be shared with the user.
            </div>
            <textarea class="form-control" id="rejectionReason" rows="3" required 
                placeholder="Enter detailed reason for rejection..."></textarea>
            <div class="mt-3">
                <button class="btn btn-danger" onclick="confirmRejection('${userId}')">Confirm Rejection</button>
                <button class="btn btn-secondary" onclick="hideRejectForm()">Cancel</button>
            </div>
        </div>
    `;
}

// Confirm rejection
function confirmRejection(userId) {
    const reason = document.getElementById('rejectionReason').value.trim();
    if (!reason) {
        showError('Please provide a reason for rejection');
        return;
    }

    if (confirm('Are you sure you want to reject this KYC application?')) {
        rejectKyc(userId, reason);
    }
}

// Hide reject form
function hideRejectForm() {
    const rejectForm = document.getElementById('rejectForm');
    if (rejectForm) rejectForm.remove();
}

// Reject KYC request
function rejectKyc(userId, reason) {
    const kycRequests = JSON.parse(localStorage.getItem('kycRequests') || '{}');
    if (!kycRequests[userId]) {
        showError('KYC data not found');
        return;
    }

    const adminUsername = localStorage.getItem('adminUsername');
    if (!adminUsername) {
        showError('Admin session not found. Please login again.');
        return;
    }

    // Update KYC status
    kycRequests[userId] = {
        ...kycRequests[userId],
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
        rejectedBy: adminUsername,
        rejectionReason: reason,
        // Clear any previous approval data
        approvedAt: null,
        approvedBy: null
    };

    // Save updated KYC data
    localStorage.setItem('kycRequests', JSON.stringify(kycRequests));

    // Update user's KYC status
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[userId]) {
        users[userId].kycVerified = false;
        users[userId].kycStatus = 'rejected';
        users[userId].kycLastUpdated = new Date().toISOString();
        localStorage.setItem('users', JSON.stringify(users));
    }

    // Close modal and refresh
    bootstrap.Modal.getInstance(document.getElementById('kycModal')).hide();
    showSuccess('KYC request rejected successfully');
    loadKycRequests(); // Reload data and update display
}

// Update KYC statistics
function updateKycStats(requests) {
    const stats = requests.reduce((acc, req) => {
        acc[req.status] = (acc[req.status] || 0) + 1;
        return acc;
    }, { pending: 0, approved: 0, rejected: 0 });

    document.getElementById('totalRequests').textContent = requests.length;
    document.getElementById('pendingRequests').textContent = stats.pending || 0;
    document.getElementById('approvedRequests').textContent = stats.approved || 0;
    document.getElementById('rejectedRequests').textContent = stats.rejected || 0;
}

// Helper function to get status color
function getStatusColor(status) {
    const colors = {
        pending: 'warning',
        approved: 'success',
        rejected: 'danger'
    };
    return colors[status] || 'secondary';
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

// Initialize KYC management when document is ready
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('kycApplications')) {
        // Initial load of KYC requests
        loadKycRequests();

        // Add event listeners for filtering with debouncing
        const debouncedFilter = debounce(filterAndDisplayRequests, 300);
        
        document.getElementById('statusFilter')?.addEventListener('change', debouncedFilter);
        document.getElementById('searchInput')?.addEventListener('input', debouncedFilter);
    }
}); 