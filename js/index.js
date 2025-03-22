// Index page specific functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize any carousels
    const evCarousel = document.querySelector('#evCarousel');
    if (evCarousel) {
        new bootstrap.Carousel(evCarousel, {
            interval: 3000,
            wrap: true
        });
    }

    // Initialize any tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Handle newsletter subscription
    const newsletterForm = document.querySelector('#newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            alert(`Thank you for subscribing with: ${email}`);
            this.reset();
        });
    }
}); 