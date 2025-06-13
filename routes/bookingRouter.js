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

router.use(protect);

// User routes
router.get('/my-bookings', getMyBookings);

// Admin/Manager routes
router.use(allowedTo('admin', 'manager'));

router
  .route('/')
  .get(getBookings)
  .post(createBookingValidator, createBooking);

router
  .route('/:id')
  .get(getBookingValidator, getBooking)
  .put(updateBookingValidator, updateBookingStatus);

// Admin only routes
router.use(allowedTo('admin'));

router.delete('/:id', deleteBookingValidator, deleteBooking);

module.exports = router;