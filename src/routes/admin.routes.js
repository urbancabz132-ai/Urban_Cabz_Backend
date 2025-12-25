// src/routes/admin.routes.js
const express = require('express');
const { body } = require('express-validator');
const adminController = require('../controllers/admin.controller');
const lifecycleController = require('../controllers/bookingLifecycle.controller');
const { requireAuth, requireAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

// Simple check for current admin user
router.get('/me', requireAuth, requireAdmin, adminController.me);

// List all paid bookings (tickets) for admin
router.get('/bookings', requireAuth, requireAdmin, adminController.listPaidBookings);

// Get single booking ticket (with assignment + customer details)
router.get('/bookings/:bookingId', requireAuth, requireAdmin, adminController.getBookingTicket);

// Create/update taxi assignment for a booking
router.post(
  '/bookings/:bookingId/assign-taxi',
  requireAuth,
  requireAdmin,
  [
    body('driverName').isString().notEmpty(),
    body('driverNumber').isString().notEmpty(),
    body('cabNumber').isString().notEmpty(),
    body('cabName').isString().notEmpty(),
  ],
  adminController.upsertAssignTaxi
);

// ===================== BOOKING LIFECYCLE ROUTES =====================

// Update booking status (manual trip lifecycle)
router.patch('/bookings/:id/status', requireAuth, requireAdmin, lifecycleController.updateBookingStatus);

// Complete trip with fare adjustments (extra KM, tolls, waiting)
router.post('/bookings/:id/complete', requireAuth, requireAdmin, lifecycleController.completeTrip);

// Cancel booking with reason
router.post('/bookings/:id/cancel', requireAuth, requireAdmin, lifecycleController.cancelBooking);

// Internal notes for a booking
router.get('/bookings/:id/notes', requireAuth, requireAdmin, lifecycleController.getBookingNotes);
router.post('/bookings/:id/notes', requireAuth, requireAdmin, lifecycleController.addBookingNote);

// ===================== HISTORY & PENDING ROUTES =====================

// Get completed bookings (History table view)
router.get('/history/completed', requireAuth, requireAdmin, adminController.getCompletedBookings);

// Get cancelled bookings (Cancelled History table view)
router.get('/history/cancelled', requireAuth, requireAdmin, adminController.getCancelledBookings);

// Get pending payment bookings (incomplete Razorpay transactions)
router.get('/pending-payments', requireAuth, requireAdmin, adminController.getPendingPayments);

module.exports = router;


