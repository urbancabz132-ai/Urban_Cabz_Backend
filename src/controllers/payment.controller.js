// src/controllers/payment.controller.js
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const { createOrder } = require('../services/payment.razorpay');
const bookingService = require('../services/booking.services');

// POST /api/v1/payments/create-order
async function createRazorpayOrder(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const {
      amount,
      currency = 'INR',
      // Booking details
      pickupLocation,
      dropLocation,
      scheduledAt,
      distanceKm,
      estimatedFare,
      totalAmount
    } = req.body;

    // Create Razorpay order
    const order = await createOrder({
      amount,
      currency,
      receipt: `user_${userId}_${Date.now()}`
    });

    // Create booking with PENDING_PAYMENT status and payment with PENDING status
    const booking = await bookingService.createBookingWithPendingPayment({
      userId,
      pickupLocation,
      dropLocation,
      scheduledAt,
      distanceKm,
      estimatedFare,
      totalAmount,
      razorpayOrderId: order.id
    });

    return res.status(201).json({
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      bookingId: booking.id,
      paymentId: booking.payments[0]?.id
    });
  } catch (err) {
    console.error(err);
    const status = err.status || 500;
    const message = err.message || 'Internal server error';
    return res.status(status).json({ message });
  }
}

// POST /api/v1/payments/verify-and-book
async function verifyPaymentAndCreateBooking(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      // Razorpay payload
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Update existing booking and payment to SUCCESS status
    const booking = await bookingService.updateBookingAfterPaymentSuccess({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id
    });

    return res.status(200).json({ 
      message: 'Payment verified and booking confirmed',
      booking 
    });
  } catch (err) {
    console.error(err);
    const status = err.status || 500;
    const message = err.message || 'Internal server error';
    return res.status(status).json({ message });
  }
}

module.exports = {
  createRazorpayOrder,
  verifyPaymentAndCreateBooking
};


