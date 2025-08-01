const express = require('express');
const {
  getBookings,
  getBooking,
  createBooking,
  updateBookingStatus,
  deleteBooking,
  getMyBookings,
} = require('../services/bookingServices');
const {
  createBookingValidator,
  getBookingValidator,
  updateBookingValidator,
  deleteBookingValidator,
} = require('../utils/validators/bookingValidator');
const { protect, allowedTo } = require('../services/authServices');

const router = express.Router();

// ── Require login for all booking routes ────────────────────────────────
router.use(protect);

// ── USER ROUTES ─────────────────────────────────────────────────────────
// View your own bookings
router.get(
  '/my-bookings',
  allowedTo('user'),
  getMyBookings
);
// Create a new booking
router.post(
  '/',
  allowedTo('user'),
  createBookingValidator,
  createBooking
);

// ── COMPANY‑ADMIN & SUPER‑ADMIN ROUTES ───────────────────────────────────
// List bookings for your company (or all, if super‑admin)
router.get(
  '/',
  allowedTo('super-admin', 'company-admin'),
  getBookings
);

// ── SINGLE BOOKING OPERATIONS ────────────────────────────────────────────
router
  .route('/:id')
  // Get booking (user can view own; company-admin their company’s; super-admin any)
  .get(
    allowedTo('super-admin', 'company-admin', 'user'),
    getBookingValidator,
    getBooking
  )
  // Update (confirm/cancel) — only company-admin for own company or super-admin
  .put(
    allowedTo('super-admin', 'company-admin'),
    updateBookingValidator,
    updateBookingStatus
  )
  // Delete — only company-admin for own company or super-admin
  .delete(
    allowedTo('super-admin', 'company-admin'),
    deleteBookingValidator,
    deleteBooking
  );

module.exports = router;