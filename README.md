# EV Rental Management System

A secure web application for electric vehicle (EV) rentals with robust KYC verification, payment processing, and station master approval workflows.

## Features

- User registration with OTP verification
- Secure login system
- Browse different EV categories (Scooters, Bikes, Cars)
- Real-time vehicle availability
- Booking management system
- Review and rating system
- Responsive design for all devices

## Pages

1. **Home Page (`index.html`)**
   - Introduction to EV Rentals
   - Featured vehicles
   - Key benefits
   - Call-to-action buttons

2. **Registration Page (`register.html`)**
   - User registration form
   - OTP verification
   - ID verification upload
   - Form validation

3. **Rentals Page (`rentals.html`)**
   - Vehicle categories
   - Pricing information
   - Vehicle details
   - Booking functionality

4. **Bookings Page (`bookings.html`)**
   - Active rentals
   - Booking history
   - Rental extension
   - Booking cancellation

5. **Reviews Page (`reviews.html`)**
   - Customer reviews
   - Rating system
   - Review submission
   - Photo uploads

## Technology Stack

- HTML5
- CSS3
- JavaScript
- Bootstrap 5.3
- Font Awesome Icons
- Node.js (for backend implementation)
- Express.js (for backend implementation)

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd ev-rental-management
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create necessary directories:
   ```bash
   mkdir images css js
   ```

4. Add required images to the `images` directory:
   - Vehicle images (scooter1.jpg, bike1.jpg, car1.jpg)
   - User avatars (user1.jpg, user2.jpg, user3.jpg)
   - Review images (review1.jpg, review2.jpg, review3.jpg)
   - Hero background (hero-bg.jpg)

5. Start the development server:
   ```bash
   npm start
   ```

## Project Structure

```
ev-rental-management/
├── index.html
├── register.html
├── rentals.html
├── bookings.html
├── reviews.html
├── css/
│   └── style.css
├── js/
│   └── main.js
├── images/
│   ├── vehicles/
│   ├── users/
│   └── reviews/
└── README.md
```

## Security Features

- OTP verification for phone numbers
- Secure file upload for ID verification
- Input validation and sanitization
- Secure session management
- Protected API endpoints

## Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For any queries or support, please contact:
- Email: support@evrentals.com
- Phone: +1 234 567 890 