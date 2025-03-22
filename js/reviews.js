// Reviews page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Handle review filtering
    const filterForm = document.querySelector('#reviewFilterForm');
    if (filterForm) {
        filterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            filterReviews();
        });
    }

    // Handle review submission
    const reviewForm = document.querySelector('#reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitReview();
        });
    }

    // Initialize star rating
    initializeStarRating();
});

function filterReviews() {
    const vehicleType = document.querySelector('#vehicleTypeFilter').value;
    const rating = document.querySelector('#ratingFilter').value;
    const sortBy = document.querySelector('#sortBy').value;

    // In a real application, this would make an API call to filter reviews
    console.log('Filtering reviews:', { vehicleType, rating, sortBy });
    alert('Reviews filtered! This would update the reviews list in a real application.');
}

function submitReview() {
    const vehicleId = document.querySelector('#vehicleSelect').value;
    const rating = document.querySelector('#ratingInput').value;
    const comment = document.querySelector('#reviewComment').value;

    // In a real application, this would make an API call to submit the review
    console.log('Submitting review:', { vehicleId, rating, comment });
    alert('Review submitted successfully!');

    // Reset form
    document.querySelector('#reviewForm').reset();
    resetStarRating();
}

function initializeStarRating() {
    const ratingContainer = document.querySelector('.star-rating');
    if (!ratingContainer) return;

    const stars = ratingContainer.querySelectorAll('.star');
    const ratingInput = document.querySelector('#ratingInput');

    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            const rating = index + 1;
            ratingInput.value = rating;
            updateStarDisplay(rating);
        });

        star.addEventListener('mouseover', () => {
            updateStarDisplay(index + 1);
        });

        star.addEventListener('mouseout', () => {
            const currentRating = ratingInput.value || 0;
            updateStarDisplay(currentRating);
        });
    });
}

function updateStarDisplay(rating) {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        star.classList.toggle('active', index < rating);
    });
}

function resetStarRating() {
    const ratingInput = document.querySelector('#ratingInput');
    if (ratingInput) {
        ratingInput.value = '';
        updateStarDisplay(0);
    }
} 