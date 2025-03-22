// Bookings page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    // Load and display bookings
    displayBookings();

    // Initialize any cancel booking buttons
    initializeCancelButtons();

    // Handle booking extension
    const extendButtons = document.querySelectorAll('.extend-booking');
    extendButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const bookingId = this.getAttribute('data-booking-id');
            showExtendModal(bookingId);
        });
    });

    // Handle extension form submission
    const extensionForm = document.querySelector('#extensionForm');
    if (extensionForm) {
        extensionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleExtension();
        });
    }
});

function displayBookings() {
    const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    const activeBookingsContainer = document.querySelector('#activeBookings');
    const pastBookingsContainer = document.querySelector('#pastBookings');
    
    if (!activeBookingsContainer || !pastBookingsContainer) return;

    const now = new Date();
    let activeBookings = [];
    let pastBookings = [];

    // Sort bookings into active and past
    bookings.forEach(booking => {
        const endDate = new Date(booking.endDate);
        if (endDate >= now) {
            activeBookings.push(booking);
        } else {
            pastBookings.push(booking);
        }
    });

    // Display active bookings
    if (activeBookings.length === 0) {
        activeBookingsContainer.innerHTML = '<div class="alert alert-info">No active bookings found.</div>';
    } else {
        activeBookingsContainer.innerHTML = activeBookings.map(booking => createBookingCard(booking, true)).join('');
    }

    // Display past bookings
    if (pastBookings.length === 0) {
        pastBookingsContainer.innerHTML = '<div class="alert alert-info">No past bookings found.</div>';
    } else {
        pastBookingsContainer.innerHTML = pastBookings.map(booking => createBookingCard(booking, false)).join('');
    }
}

function createBookingCard(booking, isCurrent) {
    const startDate = new Date(booking.startDate).toLocaleDateString();
    const endDate = new Date(booking.endDate).toLocaleDateString();
    const startTime = booking.startTime || '10:00';
    const endTime = booking.endTime || '10:00';
    
    return `
        <div class="col-md-6 col-lg-4">
            <div class="card booking-card">
                <div class="booking-status ${getStatusClass(booking.status)}">
                    ${capitalizeFirst(booking.status)}
                </div>
                <img src="${booking.vehicleImage}" class="card-img-top vehicle-image" alt="${booking.vehicleName}">
                <div class="card-body">
                    <h5 class="card-title">${booking.vehicleName}</h5>
                    <p class="card-text">Booking ID: ${booking.bookingId}</p>
                    
                    <div class="booking-details">
                        <p><strong>Duration:</strong><br>
                           From: ${startDate} ${startTime}<br>
                           To: ${endDate} ${endTime}<br>
                           (${booking.duration?.days || 0} days, ${booking.duration?.hours || 0} hours)
                        </p>
                        <p><strong>Pickup:</strong> ${booking.pickupLocation}</p>
                        <p><strong>Drop-off:</strong> ${booking.dropoffLocation}</p>
                        
                        <div class="cost-breakdown mt-3">
                            <p class="mb-2"><strong>Cost Breakdown:</strong></p>
                            <div class="row">
                                <div class="col-8">Base Cost:</div>
                                <div class="col-4 text-end">₹${booking.costs.baseCost}</div>
                            </div>
                            <div class="row">
                                <div class="col-8">Insurance:</div>
                                <div class="col-4 text-end">₹${booking.costs.insurance}</div>
                            </div>
                            <div class="row">
                                <div class="col-8">Tax:</div>
                                <div class="col-4 text-end">₹${booking.costs.tax}</div>
                            </div>
                            <div class="row fw-bold mt-2">
                                <div class="col-8">Total:</div>
                                <div class="col-4 text-end">₹${booking.costs.total}</div>
                            </div>
                        </div>
                    </div>
                    
                    ${isCurrent ? `
                        <div class="mt-3">
                            <button class="btn btn-danger" onclick="showCancellationModal('${booking.bookingId}')">
                                Cancel Booking
                            </button>
                            <button class="btn btn-primary" onclick="extendBooking('${booking.bookingId}')">
                                Extend Rental
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

function getStatusBadgeColor(status) {
    switch (status.toLowerCase()) {
        case 'confirmed':
            return 'success';
        case 'pending':
            return 'warning';
        case 'cancelled':
            return 'danger';
        default:
            return 'secondary';
    }
}

function createActiveBookingButtons(booking) {
    return `
        <div class="mt-3">
            <button class="btn btn-danger btn-sm cancel-booking" data-booking-id="${booking.bookingId}">
                Cancel Booking
            </button>
            <button class="btn btn-primary btn-sm" onclick="extendBooking('${booking.bookingId}')">
                Extend Booking
            </button>
            <button class="btn btn-info btn-sm" onclick="viewDetails('${booking.bookingId}')">
                View Details
            </button>
        </div>
    `;
}

function createPastBookingButtons(booking) {
    return `
        <div class="mt-3">
            <button class="btn btn-primary btn-sm" onclick="bookAgain('${booking.bookingId}')">
                Book Again
            </button>
            <button class="btn btn-info btn-sm" onclick="viewDetails('${booking.bookingId}')">
                View Details
            </button>
            ${!booking.reviewed ? `
                <button class="btn btn-success btn-sm" onclick="addReview('${booking.bookingId}')">
                    Add Review
                </button>
            ` : ''}
        </div>
    `;
}

function initializeCancelButtons() {
    document.querySelectorAll('.cancel-booking').forEach(button => {
        button.addEventListener('click', function() {
            const bookingId = this.getAttribute('data-booking-id');
            cancelBooking(bookingId);
        });
    });
}

function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    const bookingIndex = bookings.findIndex(b => b.bookingId === bookingId);

    if (bookingIndex !== -1) {
        bookings[bookingIndex].status = 'cancelled';
        localStorage.setItem('userBookings', JSON.stringify(bookings));
        
        // Refresh the display
        displayBookings();
        alert('Booking cancelled successfully!');
    }
}

function extendBooking(bookingId) {
    // Implementation for extending booking
    alert('Booking extension feature coming soon!');
}

function viewDetails(bookingId) {
    // Implementation for viewing booking details
    const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    const booking = bookings.find(b => b.bookingId === bookingId);
    
    if (booking) {
        const startDate = new Date(booking.startDate).toLocaleDateString();
        const endDate = new Date(booking.endDate).toLocaleDateString();
        
        const details = `
Booking Details:

Booking ID: ${booking.bookingId}
Vehicle: ${booking.vehicleName}
Type: ${booking.vehicleType}
Status: ${booking.status}

Dates:
- Start: ${startDate}
- End: ${endDate}

Locations:
- Pickup: ${booking.pickupLocation}
- Drop-off: ${booking.dropoffLocation}

Cost Breakdown:
- Base Cost: ₹${booking.costs.baseCost.toFixed(2)}
- Insurance: ₹${booking.costs.insurance.toFixed(2)}
- Tax: ₹${booking.costs.tax.toFixed(2)}
- Total: ₹${booking.costs.total.toFixed(2)}

Driver License: ${booking.driverLicense}
Booking Created: ${new Date(booking.createdAt).toLocaleString()}
`;
        alert(details);
    }
}

function bookAgain(bookingId) {
    const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    const booking = bookings.find(b => b.bookingId === bookingId);
    
    if (booking) {
        // Store the vehicle details in session storage
        sessionStorage.setItem('rebookVehicle', JSON.stringify({
            vehicleId: booking.vehicleId,
            vehicleName: booking.vehicleName,
            vehicleType: booking.vehicleType,
            vehicleRate: booking.vehicleRate
        }));
        
        // Redirect to rentals page
        window.location.href = 'rentals.html';
    }
}

function addReview(bookingId) {
    // Implementation for adding review
    alert('Review feature coming soon!');
}

function showExtendModal(bookingId) {
    const modal = document.querySelector('#extendModal');
    if (modal) {
        modal.setAttribute('data-booking-id', bookingId);
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
    }
}

function handleExtension() {
    const modal = document.querySelector('#extendModal');
    const bookingId = modal.getAttribute('data-booking-id');
    const extensionDays = document.querySelector('#extensionDays').value;

    // In a real application, this would make an API call to extend the booking
    console.log('Extending booking:', { bookingId, extensionDays });
    alert('Booking extended successfully!');

    // Close modal and reset form
    const modalInstance = bootstrap.Modal.getInstance(modal);
    modalInstance.hide();
    document.querySelector('#extensionForm').reset();
    
    // Reload page or update UI
    location.reload();
}

function updateBookingStatistics() {
    const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    const currentDate = new Date();
    
    // Calculate statistics
    const stats = bookings.reduce((acc, booking) => {
        const endDateTime = new Date(`${booking.endDate}T${booking.endTime || '23:59'}`);
        
        if (endDateTime >= currentDate && booking.status === 'confirmed') {
            acc.active++;
        }
        
        if (endDateTime < currentDate && booking.status !== 'cancelled') {
            acc.completed++;
        }
        
        if (booking.status !== 'cancelled') {
            acc.totalSpent += booking.costs.total;
            // Calculate total hours for distance estimation
            const duration = booking.duration || { totalHours: 0 };
            acc.totalHours += duration.totalHours;
        }
        
        return acc;
    }, { active: 0, completed: 0, totalSpent: 0, totalHours: 0 });
    
    // Update DOM
    document.getElementById('activeBookings').textContent = stats.active;
    document.getElementById('completedBookings').textContent = stats.completed;
    document.getElementById('totalSpent').textContent = `₹${Math.round(stats.totalSpent)}`;
    
    // Estimate total distance (assuming average speed of 30 km/h)
    const estimatedDistance = Math.round(stats.totalHours * 30);
    document.getElementById('totalDistance').textContent = `${estimatedDistance}`;
} 