// Available vehicles data
const vehicles = [
    // Scooters
    {
        id: 'ATHER450X',
        name: 'Ather 450X',
        type: 'Scooter',
        rate: {
            daily: 499,
            weekly: 464,  // 7% off
            monthly: 424  // 15% off
        },
        image: 'images/ather-450x.jpg',
        description: 'Premium electric scooter with advanced features',
        range: '116 km',
        topSpeed: '80 kmph',
        chargingTime: '4.5 hours',
        available: true
    },
    {
        id: 'OLAELECTRIC',
        name: 'Ola S1 Pro',
        type: 'Scooter',
        rate: {
            daily: 549,
            weekly: 511,  // 7% off
            monthly: 467  // 15% off
        },
        image: 'images/ola-s1.jpg',
        description: 'Modern electric scooter with high performance',
        range: '181 km',
        topSpeed: '115 kmph',
        chargingTime: '6.5 hours',
        available: true
    },
    {
        id: 'TVSIQUBE',
        name: 'TVS iQube',
        type: 'Scooter',
        rate: {
            daily: 479,
            weekly: 446,  // 7% off
            monthly: 407  // 15% off
        },
        image: 'images/tvs-iqube.jpg',
        description: 'Reliable electric scooter for daily commute',
        range: '100 km',
        topSpeed: '78 kmph',
        chargingTime: '5 hours',
        available: true
    },
    // Bikes
    {
        id: 'REVOLTRV400',
        name: 'Revolt RV400',
        type: 'Bike',
        rate: {
            daily: 699,
            weekly: 650,  // 7% off
            monthly: 594  // 15% off
        },
        image: 'images/revolt-rv400.jpg',
        description: 'Powerful electric motorcycle with great range',
        range: '150 km',
        topSpeed: '85 kmph',
        chargingTime: '4.5 hours',
        available: true
    },
    {
        id: 'TORKKRATOS',
        name: 'Tork Kratos R',
        type: 'Bike',
        rate: {
            daily: 799,
            weekly: 743,  // 7% off
            monthly: 679  // 15% off
        },
        image: 'images/tork-kratos.jpg',
        description: 'High-performance electric sports bike',
        range: '180 km',
        topSpeed: '105 kmph',
        chargingTime: '4 hours',
        available: true
    },
    {
        id: 'ULTRAVIOLETTE',
        name: 'Ultraviolette F77',
        type: 'Bike',
        rate: {
            daily: 899,
            weekly: 836,  // 7% off
            monthly: 764  // 15% off
        },
        image: 'images/ultraviolette-f77.jpg',
        description: 'Premium electric sports bike with cutting-edge technology',
        range: '200 km',
        topSpeed: '140 kmph',
        chargingTime: '5 hours',
        available: true
    },
    // Cars
    {
        id: 'NEXONEV',
        name: 'Tata Nexon EV',
        type: 'Car',
        rate: {
            daily: 1499,
            weekly: 1394,  // 7% off
            monthly: 1274  // 15% off
        },
        image: 'images/nexon-ev.jpg',
        description: 'Comfortable electric SUV for family trips',
        range: '312 km',
        topSpeed: '120 kmph',
        chargingTime: '8 hours',
        available: true
    },
    {
        id: 'MG_ZS_EV',
        name: 'MG ZS EV',
        type: 'Car',
        rate: {
            daily: 1799,
            weekly: 1673,  // 7% off
            monthly: 1529  // 15% off
        },
        image: 'images/mg-zs-ev.jpg',
        description: 'Premium electric SUV with advanced features',
        range: '419 km',
        topSpeed: '140 kmph',
        chargingTime: '8.5 hours',
        available: true
    },
    {
        id: 'KIA_EV6',
        name: 'Kia EV6',
        type: 'Car',
        rate: {
            daily: 2499,
            weekly: 2324,  // 7% off
            monthly: 2124  // 15% off
        },
        image: 'images/kia-ev6.jpg',
        description: 'Luxury electric crossover with stunning performance',
        range: '528 km',
        topSpeed: '185 kmph',
        chargingTime: '7.2 hours',
        available: true
    }
];

// Rentals page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check login status
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    // Initialize date pickers with restrictions
    initializeDatePickers();
    
    // Display vehicles
    displayVehicles();
    
    // Add event listeners for filters
    document.getElementById('vehicleTypeFilter').addEventListener('change', applyFilters);
    document.getElementById('rentalDurationFilter').addEventListener('change', applyFilters);
    
    // Check for rebook data
    checkRebookData();

    // Handle vehicle filtering
    const filterForm = document.querySelector('#filterForm');
    if (filterForm) {
        filterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            filterVehicles();
        });
    }

    // Handle booking modal
    const bookingModal = document.querySelector('#bookingModal');
    if (bookingModal) {
        bookingModal.addEventListener('show.bs.modal', function(event) {
            const button = event.relatedTarget;
            const vehicleId = button.getAttribute('data-vehicle-id');
            const vehicleName = button.getAttribute('data-vehicle-name');
            const vehicleType = button.getAttribute('data-vehicle-type');
            const vehicleRate = button.getAttribute('data-vehicle-rate');
            
            const modalTitle = bookingModal.querySelector('.modal-title');
            modalTitle.textContent = `Book ${vehicleName}`;
            
            // Store vehicle info for booking
            bookingModal.setAttribute('data-vehicle-id', vehicleId);
            bookingModal.setAttribute('data-vehicle-type', vehicleType);
            bookingModal.setAttribute('data-vehicle-rate', vehicleRate);

            // Reset form and calculations
            resetBookingForm();
        });
    }

    // Handle booking form submission
    const bookingForm = document.querySelector('#bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateBookingForm()) {
                handleBooking();
            }
        });

        // Add event listeners for date changes to update total cost
        const startDate = bookingForm.querySelector('#startDate');
        const endDate = bookingForm.querySelector('#endDate');
        [startDate, endDate].forEach(input => {
            input.addEventListener('change', updateTotalCost);
        });
    }
});

// Initialize date and time pickers with restrictions
function initializeDatePickers() {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3); // Allow bookings up to 3 months in advance
    
    // Set min/max dates for start date
    const startDateInput = document.getElementById('startDate');
    startDateInput.min = today.toISOString().split('T')[0];
    startDateInput.max = maxDate.toISOString().split('T')[0];
    
    // Set min/max dates for end date
    const endDateInput = document.getElementById('endDate');
    endDateInput.min = today.toISOString().split('T')[0];
    endDateInput.max = maxDate.toISOString().split('T')[0];
    
    // Set default times
    const startTimeInput = document.getElementById('startTime');
    const endTimeInput = document.getElementById('endTime');
    startTimeInput.value = '10:00';
    endTimeInput.value = '10:00';
    
    // Add event listeners for all inputs
    [startDateInput, endDateInput, startTimeInput, endTimeInput].forEach(input => {
        input.addEventListener('change', updateTotalCost);
    });
    
    // Update end date min when start date changes
    startDateInput.addEventListener('change', function() {
        endDateInput.min = this.value;
        if (endDateInput.value < this.value) {
            endDateInput.value = this.value;
        }
        updateTotalCost();
    });
    
    // Update start date max when end date changes
    endDateInput.addEventListener('change', function() {
        startDateInput.max = this.value;
        if (startDateInput.value > this.value) {
            startDateInput.value = this.value;
        }
        updateTotalCost();
    });
}

// Display vehicles in the page with filtered results
function displayVehicles(filteredVehicles = vehicles) {
    const vehicleContainer = document.getElementById('vehicleContainer');
    if (!vehicleContainer) return;

    const rentalDuration = document.getElementById('rentalDurationFilter').value;

    vehicleContainer.innerHTML = filteredVehicles.map(vehicle => `
        <div class="col-md-4 mb-4">
            <div class="card h-100">
                <img src="${vehicle.image}" class="card-img-top" alt="${vehicle.name}" style="height: 200px; object-fit: cover;">
                <div class="card-body">
                    <h5 class="card-title">${vehicle.name}</h5>
                    <p class="card-text">${vehicle.description}</p>
                    <ul class="list-unstyled">
                        <li><strong>Range:</strong> ${vehicle.range}</li>
                        <li><strong>Top Speed:</strong> ${vehicle.topSpeed}</li>
                        <li><strong>Charging Time:</strong> ${vehicle.chargingTime}</li>
                        <li><strong>Rate:</strong> ₹${vehicle.rate[rentalDuration]}/day</li>
                        ${rentalDuration !== 'daily' ? 
                            `<li class="text-success"><strong>Savings:</strong> ${rentalDuration === 'weekly' ? '7%' : '15%'} off daily rate</li>` 
                            : ''}
                    </ul>
                    <button class="btn btn-primary" 
                            data-bs-toggle="modal"
                            data-bs-target="#bookingModal"
                            data-vehicle-id="${vehicle.id}"
                            data-vehicle-name="${vehicle.name}"
                            data-vehicle-type="${vehicle.type}"
                            data-vehicle-rate="${vehicle.rate[rentalDuration]}"
                            ${vehicle.available ? '' : 'disabled'}>
                        ${vehicle.available ? 'Book Now' : 'Not Available'}
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Apply filters for vehicle type and rental duration
function applyFilters() {
    const selectedType = document.getElementById('vehicleTypeFilter').value;
    const filteredVehicles = selectedType === 'all' 
        ? vehicles 
        : vehicles.filter(vehicle => vehicle.type === selectedType);
    
    displayVehicles(filteredVehicles);
}

// Calculate rental duration including hours
function calculateDuration(startDate, endDate, startTime, endTime) {
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    const diffTime = Math.abs(end - start);
    
    // Calculate total hours
    const totalHours = diffTime / (1000 * 60 * 60);
    
    // Calculate full days and remaining hours
    const days = Math.floor(totalHours / 24);
    const hours = Math.round(totalHours % 24);
    
    return { days, hours, totalHours };
}

// Calculate total cost based on rental duration
function updateTotalCost() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const vehicleId = document.getElementById('bookingModal').dataset.vehicleId;
    const vehicle = vehicles.find(v => v.id === vehicleId);
    
    if (!startDate || !endDate || !startTime || !endTime || !vehicle) return;
    
    // Calculate duration
    const duration = calculateDuration(startDate, endDate, startTime, endTime);
    
    // Determine rental type based on total duration
    const rentalDuration = getRentalDurationType(duration.days);
    const rate = vehicle.rate[rentalDuration];
    
    // Calculate base cost
    let baseCost = rate * duration.days;
    
    // Add hourly rate for partial days (calculated as proportion of daily rate)
    if (duration.hours > 0) {
        const hourlyRate = rate / 24;
        baseCost += hourlyRate * duration.hours;
    }
    
    // Round to 2 decimal places
    baseCost = Math.round(baseCost * 100) / 100;
    
    const insurance = Math.round(baseCost * 0.15);
    const tax = Math.round((baseCost + insurance) * 0.18);
    const total = baseCost + insurance + tax;
    
    // Update display
    document.getElementById('rentalDays').textContent = duration.days;
    document.getElementById('rentalHours').textContent = duration.hours;
    document.getElementById('baseCost').textContent = `₹${baseCost}`;
    document.getElementById('insurance').textContent = `₹${insurance}`;
    document.getElementById('tax').textContent = `₹${tax}`;
    document.getElementById('totalCost').textContent = `₹${total}`;
    
    // Show savings if applicable
    const savingsElement = document.getElementById('savingsInfo');
    if (savingsElement) {
        if (rentalDuration !== 'daily') {
            const savings = rentalDuration === 'weekly' ? '7%' : '15%';
            savingsElement.textContent = `You save ${savings} with ${rentalDuration} rental!`;
            savingsElement.style.display = 'block';
        } else {
            savingsElement.style.display = 'none';
        }
    }
}

// Determine rental duration type based on number of days
function getRentalDurationType(days) {
    if (days >= 30) return 'monthly';
    if (days >= 7) return 'weekly';
    return 'daily';
}

// Handle booking submission
function handleBooking(event) {
    event.preventDefault();
    
    // Get form data
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const pickupLocation = document.getElementById('pickupLocation').value;
    const dropoffLocation = document.getElementById('dropoffLocation').value;
    const driverLicense = document.getElementById('driverLicense').value;
    const termsAccepted = document.getElementById('termsAccepted').checked;
    
    // Validate form
    if (!startDate || !endDate || !startTime || !endTime || !pickupLocation || !dropoffLocation || !driverLicense || !termsAccepted) {
        showError('Please fill in all fields and accept the terms');
        return;
    }
    
    // Get vehicle details
    const vehicleId = document.getElementById('bookingModal').dataset.vehicleId;
    const vehicle = vehicles.find(v => v.id === vehicleId);
    
    if (!vehicle) {
        showError('Vehicle not found');
        return;
    }
    
    // Calculate duration and costs
    const duration = calculateDuration(startDate, endDate, startTime, endTime);
    const rentalDuration = getRentalDurationType(duration.days);
    const rate = vehicle.rate[rentalDuration];
    
    // Calculate costs
    let baseCost = rate * duration.days;
    if (duration.hours > 0) {
        const hourlyRate = rate / 24;
        baseCost += hourlyRate * duration.hours;
    }
    baseCost = Math.round(baseCost * 100) / 100;
    
    const insurance = Math.round(baseCost * 0.15);
    const tax = Math.round((baseCost + insurance) * 0.18);
    const total = baseCost + insurance + tax;
    
    // Create booking object
    const booking = {
        bookingId: generateBookingId(vehicle.type),
        userId: localStorage.getItem('userId'),
        userName: localStorage.getItem('userName'),
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        vehicleType: vehicle.type,
        vehicleImage: vehicle.image,
        vehicleRate: vehicle.rate[rentalDuration],
        startDate,
        endDate,
        startTime,
        endTime,
        pickupLocation,
        dropoffLocation,
        driverLicense,
        status: 'confirmed',
        duration: {
            days: duration.days,
            hours: duration.hours,
            totalHours: duration.totalHours
        },
        costs: {
            baseCost,
            insurance,
            tax,
            total
        },
        createdAt: new Date().toISOString()
    };
    
    // Save booking
    saveBooking(booking);
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('bookingModal'));
    modal.hide();
    
    // Show success message and redirect
    showSuccess('Booking confirmed successfully! Redirecting to bookings page...');
    setTimeout(() => {
        window.location.href = 'bookings.html';
    }, 2000);
}

// Generate unique booking ID
function generateBookingId(vehicleType) {
    const prefix = vehicleType.charAt(0).toUpperCase(); // S for Scooter, B for Bike, C for Car
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}${timestamp}${random}`;
}

// Save booking to localStorage
function saveBooking(booking) {
    const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    bookings.push(booking);
    bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    localStorage.setItem('userBookings', JSON.stringify(bookings));
}

// Check for rebook data
function checkRebookData() {
    const rebookData = sessionStorage.getItem('rebookVehicle');
    if (rebookData) {
        const vehicle = JSON.parse(rebookData);
        openBookingModal(vehicle.vehicleId);
        sessionStorage.removeItem('rebookVehicle');
    }
}

// Show error message
function showError(message) {
    const errorAlert = document.getElementById('errorAlert');
    errorAlert.textContent = message;
    errorAlert.style.display = 'block';
    
    setTimeout(() => {
        errorAlert.style.display = 'none';
    }, 5000);
}

// Show success message
function showSuccess(message) {
    const successAlert = document.getElementById('successAlert');
    successAlert.textContent = message;
    successAlert.style.display = 'block';
    
    setTimeout(() => {
        successAlert.style.display = 'none';
    }, 5000);
}

function filterVehicles() {
    const type = document.querySelector('#vehicleType').value;
    const priceRange = document.querySelector('#priceRange').value;
    const availability = document.querySelector('#availability').value;
    const location = document.querySelector('#location').value;

    // In a real application, this would make an API call to filter vehicles
    // For demo, we'll just log the filter criteria
    console.log('Filtering vehicles:', { type, priceRange, availability, location });
    alert('Vehicles filtered! This would update the vehicle list in a real application.');
}

function validateBookingForm() {
    const startDate = document.querySelector('#startDate').value;
    const endDate = document.querySelector('#endDate').value;
    const pickupLocation = document.querySelector('#pickupLocation').value;
    const dropoffLocation = document.querySelector('#dropoffLocation').value;
    const driverLicense = document.querySelector('#driverLicense').value;

    if (!startDate || !endDate) {
        alert('Please select both start and end dates');
        return false;
    }

    if (!pickupLocation || !dropoffLocation) {
        alert('Please select pickup and drop-off locations');
        return false;
    }

    if (!driverLicense) {
        alert('Please enter your driver license number');
        return false;
    }

    // Check if user is logged in
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        alert('Please log in to make a booking');
        window.location.href = 'login.html';
        return false;
    }

    // Verify KYC status (in a real application, this would check with the backend)
    const kycVerified = localStorage.getItem('kycVerified') === 'true';
    if (!kycVerified) {
        alert('Please complete your KYC verification before booking');
        window.location.href = 'profile.html#kyc-verification';
        return false;
    }

    return true;
}

function resetBookingForm() {
    const form = document.querySelector('#bookingForm');
    if (form) {
        form.reset();
        // Reset cost displays
        ['rentalDays', 'rentalHours', 'baseCost', 'insurance', 'tax', 'totalCost'].forEach(id => {
            const element = document.querySelector(`#${id}`);
            if (element) element.textContent = '-';
        });
    }
} 