const asyncHandler = require('express-async-handler');
const slugify = require('slugify');

const Trip = require('../models/TripModel');
const ApiError = require('../utils/apiError');
const ApiFeatures = require('../utils/apiFeatures');

// @desc    Get list of trips
// @route   GET /api/v1/trips
// @access  Public
exports.getTrips = asyncHandler(async (req, res) => {
  // Build query
  const documentsCount = await Trip.countDocuments();
  const apiFeatures = new ApiFeatures(Trip.find(), req.query)
    .filter()
    .search()
    .sort()
    .limitFields()
    .paginate(documentsCount);

  // Execute query
  const { mongooseQuery, paginationResult } = apiFeatures;
  const trips = await mongooseQuery;

  res.status(200).json({
    results: trips.length,
    paginationResult,
    data: trips,
  });
});

// @desc    Get specific trip by id
// @route   GET /api/v1/trips/:id
// @access  Public
exports.getTrip = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const trip = await Trip.findById(id);
  if (!trip) {
    return next(new ApiError(`No trip for this id ${id}`, 404));
  }
  res.status(200).json({ data: trip });
});

// @desc    Create trip
// @route   POST /api/v1/trips
// @access  Private/Admin-Manager
exports.createTrip = asyncHandler(async (req, res) => {
  req.body.slug = slugify(req.body.title);
  const trip = await Trip.create(req.body);
  res.status(201).json({ data: trip });
});

// @desc    Update specific trip
// @route   PUT /api/v1/trips/:id
// @access  Private/Admin-Manager
exports.updateTrip = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  if (req.body.title) {
    req.body.slug = slugify(req.body.title);
  }
  
  const trip = await Trip.findByIdAndUpdate(id, req.body, {
    new: true,
  });

  if (!trip) {
    return next(new ApiError(`No trip for this id ${id}`, 404));
  }
  res.status(200).json({ data: trip });
});

// @desc    Delete specific trip
// @route   DELETE /api/v1/trips/:id
// @access  Private/Admin
exports.deleteTrip = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const trip = await Trip.findByIdAndDelete(id);
  if (!trip) {
    return next(new ApiError(`No trip for this id ${id}`, 404));
  }
  res.status(204).send();
});

// @desc    Search trips
// @route   POST /api/v1/trips/search-trips
// @access  Public
exports.searchTrips = asyncHandler(async (req, res) => {
  const { keyword, date } = req.body;
  
  let query = {};
  
  if (keyword) {
    query = {
      $or: [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { destination: { $regex: keyword, $options: 'i' } },
      ],
    };
  }
  
  if (date) {
    query['availability.date'] = { $gte: new Date(date) };
  }
  
  const trips = await Trip.find(query);
  
  res.status(200).json(trips);
});

// @desc    Check trip availability
// @route   POST /api/v1/trips/checkavailability
// @access  Public
exports.checkAvailability = asyncHandler(async (req, res, next) => {
  const { tripId, availabilityId, spotsRequested } = req.body;
  
  const trip = await Trip.findById(tripId);
  if (!trip) {
    return next(new ApiError(`No trip found with id ${tripId}`, 404));
  }
  
  const selectedDate = trip.availability.id(availabilityId);
  if (!selectedDate) {
    return next(new ApiError(`No availability found for this date`, 404));
  }
  
  const isAvailable = selectedDate.availableSpots >= spotsRequested;
  
  res.status(200).json({
    availability: isAvailable,
    trip,
    selectedDate,
  });
});

// @desc    Add review to trip
// @route   POST /api/v1/trips/:tripId/reviews
// @access  Protected/User
exports.addReview = asyncHandler(async (req, res, next) => {
  const { tripId } = req.params;
  
  const trip = await Trip.findById(tripId);
  if (!trip) {
    return next(new ApiError(`No trip found with id ${tripId}`, 404));
  }
  
  const review = {
    user: req.user.name,
    rating: req.body.rating,
    comment: req.body.comment,
    country: req.body.country || '',
  };
  
  trip.reviews.push(review);
  
  // Update ratings average
  const totalRatings = trip.reviews.reduce((sum, item) => sum + item.rating, 0);
  trip.ratingsAverage = totalRatings / trip.reviews.length;
  trip.ratingQuantity = trip.reviews.length;
  
  await trip.save();
  
  res.status(201).json({
    status: 'success',
    data: review,
  });
});