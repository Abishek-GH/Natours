/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

// stripe.js

export const bookTour = async (tourId) => {
  try {
    const res = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    console.log(res);

    if (res.data.status === 'success') {
      showAlert('success', 'Booking successful!');

      // ✅ Change button text to "Tour Booked Successfully"
      const bookBtn = document.getElementById('book-tour');
      if (bookBtn) {
        bookBtn.textContent = 'Tour Booked Successfully';
        bookBtn.disabled = true; // Optional: Disable the button
      }

      // ✅ Redirect after 1.5 seconds
      const tourSlug = res.data.booking.tour.slug;
      window.setTimeout(() => {
        location.assign(`/tour/${tourSlug}`);
      }, 1500);
    }
  } catch (err) {
    console.error(err.response ? err.response.data.message : err.message);
    showAlert('error', 'Error booking tour. Please try again.');
  }
};
