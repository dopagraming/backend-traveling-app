const express = require('express');
const {
  getTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip,
  searchTrips,
  checkAvailability,
  addReview,
} = require('../services/tripService');

const {
  createTripValidator,
  getTripValidator,
  updateTripValidator,
  deleteTripValidator,
} = require('../utils/validators/tripValidator');

const { protect, allowedTo } = require('../services/authServices');

const router = express.Router();

// Public routes
router.get('/', getTrips);
router.get('/:id', getTripValidator, getTrip);
router.post('/search-trips', searchTrips);
router.post('/checkavailability', checkAvailability);

// Protected routes
router.use(protect);

// Reviews
router.post('/:tripId/reviews', addReview);

// Admin/Manager routes
router.use(allowedTo('admin', 'manager'));

router.post('/', createTripValidator, createTrip);
router.put('/:id', updateTripValidator, updateTrip);

// Admin only routes
router.use(allowedTo('admin'));

router.delete('/:id', deleteTripValidator, deleteTrip);

module.exports = router;