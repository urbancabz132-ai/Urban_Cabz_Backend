// src/controllers/booking.controller.js
const { validationResult } = require('express-validator');
const bookingService = require('../services/booking.services');

// This endpoint assumes payment is already successful.
// In real-life you'll usually call this from a payment webhook or
// from your frontend right after receiving a "payment success" event.
async function createBookingAfterPayment(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id; // from requireAuth middleware
    const {
      pickupLocation,
      dropLocation,
      scheduledAt,
      distanceKm,
      estimatedFare,
      totalAmount,
      payment
    } = req.body;

    const booking = await bookingService.createBookingAfterPayment({
      userId,
      pickupLocation,
      dropLocation,
      scheduledAt,
      distanceKm,
      estimatedFare,
      totalAmount,
      payment
    });

    return res.status(201).json({ booking });
  } catch (err) {
    console.error(err);
    const status = err.status || 500;
    const message = err.message || 'Internal server error';
    return res.status(status).json({ message });
  }
}

async function getMyBookings(req, res) {
  try {
    const userId = req.user.id;
    const bookings = await bookingService.getMyBookings(userId);
    return res.json({ bookings });
  } catch (err) {
    console.error(err);
    const status = err.status || 500;
    const message = err.message || 'Internal server error';
    return res.status(status).json({ message });
  }
}

module.exports = {
  createBookingAfterPayment,
  getMyBookings
};


