// routes/tripRouter.js
const express = require('express');
const {
  getTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip,
  searchTrips,
  advancedSearch,
  getPopularDestinations,
  checkAvailability,
  addReview,
  getTripSuggestions,
} = require('../services/tripService');
const {
  createTripValidator,
  updateTripValidator,
  deleteTripValidator,
  getTripValidator,
} = require('../utils/validators/tripValidator');
const { protect, allowedTo } = require('../services/authServices');
const requireCompanyAccess = require('../middlewares/requireCompany');

const router = express.Router();

// ── PUBLIC ──────────────────────────────────────────────────────────────────
router.get('/', getTrips);
router.get('/popular-destinations', getPopularDestinations);
router.get('/:id', getTripValidator, getTrip);
router.post('/search-trips', searchTrips);
router.post('/advanced-search', advancedSearch);
router.post('/suggestions', getTripSuggestions);
router.post('/checkavailability', checkAvailability);

// ── PROTECTED (any logged in user) ─────────────────────────────────────────
router.use(protect);
router.post('/:tripId/reviews', addReview);

// ── COMPANY‑SCOPED & ADMIN (create & update) ───────────────────────────────
router.use(allowedTo('super-admin', 'company-admin'));

router
  .route('/')
  .post(createTripValidator, createTrip);

router
  .route('/:id')
  .put(updateTripValidator, requireCompanyAccess, updateTrip)
  .delete(deleteTripValidator, requireCompanyAccess, deleteTrip)

module.exports = router;
