const asyncHandler = require('express-async-handler');
const slugify = require('slugify');

const Trip = require('../models/TripModel');
const ApiError = require('../utils/apiError');
const ApiFeatures = require('../utils/apiFeatures');

exports.getTrips = asyncHandler(async (req, res) => {
  const filter = (req.user && req.user.role !== 'super-admin')
    ? { company: req.user.company }
    : {};

  const count = await Trip.countDocuments(filter);
  const apiFeatures = new ApiFeatures(Trip.find(filter), req.query)
    .filter()
    .search()
    .sort()
    .limitFields()
    .paginate(count);

  const trips = await apiFeatures.mongooseQuery;
  res.status(200).json({
    results: trips.length,
    paginationResult: apiFeatures.paginationResult,
    data: trips,
  });
});

// @desc    Get specific trip by id
// @route   GET /api/v1/trips/:id
// @access  Public
exports.getTrip = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const criteria = { _id: id };
  if (req.user && req.user.role !== 'super-admin') {
    criteria.company = req.user.company;
  }

  const trip = await Trip.findOne(criteria);
  if (!trip) {
    return next(new ApiError(`No trip found for id ${id}`, 404));
  }
  res.status(200).json({ data: trip });
});

// @desc    Create trip
// @route   POST /api/v1/trips
// @access  Private/Admin-Manager
exports.createTrip = asyncHandler(async (req, res) => {
  // slug
  req.body.slug = slugify(req.body.title);

  // company inject
  if (req.user.role !== 'super-admin') {
    req.body.company = req.user.company;
  }

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

  // build criteria
  const criteria = { _id: id };
  if (req.user.role !== 'super-admin') {
    criteria.company = req.user.company;
  }

  const trip = await Trip.findOneAndUpdate(criteria, req.body, {
    new: true,
    runValidators: true,
  });
  if (!trip) {
    return next(new ApiError(`No trip found for id ${id}`, 404));
  }
  res.status(200).json({ data: trip });
});

// @desc    Delete specific trip
// @route   DELETE /api/v1/trips/:id
// @access  Private (super-admin, company-admin)
exports.deleteTrip = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const filter = { _id: id };
  if (req.user.role !== 'super-admin') {
    filter.company = req.user.company;
  }
  const trip = await Trip.findOneAndDelete(filter);
  if (!trip) {
    return next(new ApiError(`No trip for this id ${id}`, 404));
  }
  res.status(204).send();
});

// @desc    Search trips with enhanced functionality
// @route   POST /api/v1/trips/search-trips
// @access  Public
exports.searchTrips = asyncHandler(async (req, res) => {
  const { keyword, date, people, destination, type, priceMin, priceMax } = req.body;

  let query = {};

  // Search by keyword (destination, title, description)
  if (keyword) {
    query.$or = [
      { title: { $regex: keyword, $options: 'i' } },
      { description: { $regex: keyword, $options: 'i' } },
      { destination: { $regex: keyword, $options: 'i' } },
    ];
  }

  // Filter by specific destination
  if (destination) {
    query.destination = { $regex: destination, $options: 'i' };
  }

  // Filter by trip type
  if (type) {
    query.type = type;
  }

  // Filter by price range
  if (priceMin || priceMax) {
    query.price = {};
    if (priceMin) query.price.$gte = priceMin;
    if (priceMax) query.price.$lte = priceMax;
  }

  // Filter by availability date
  if (date) {
    query['availability.date'] = { $gte: new Date(date) };
  }

  // Filter by available spots for people count
  if (people) {
    query['availability.availableSpots'] = { $gte: people };
  }

  const trips = await Trip.find(query).populate('category', 'title');

  res.status(200).json(trips);
});

// @desc    Advanced search with filters
// @route   POST /api/v1/trips/advanced-search
// @access  Public
exports.advancedSearch = asyncHandler(async (req, res) => {
  const {
    keyword,
    destination,
    type,
    priceMin,
    priceMax,
    durationMin,
    durationMax,
    rating,
    category,
    startDate,
    endDate,
    people,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 12
  } = req.body;

  let query = {};

  // Text search
  if (keyword) {
    query.$or = [
      { title: { $regex: keyword, $options: 'i' } },
      { description: { $regex: keyword, $options: 'i' } },
      { destination: { $regex: keyword, $options: 'i' } },
    ];
  }

  // Destination filter
  if (destination) {
    query.destination = { $regex: destination, $options: 'i' };
  }

  // Trip type filter
  if (type) {
    query.type = type;
  }

  // Category filter
  if (category) {
    query.category = category;
  }

  // Price range filter
  if (priceMin || priceMax) {
    query.price = {};
    if (priceMin) query.price.$gte = priceMin;
    if (priceMax) query.price.$lte = priceMax;
  }

  // Duration filter
  if (durationMin || durationMax) {
    query.duration = {};
    if (durationMin) query.duration.$gte = durationMin;
    if (durationMax) query.duration.$lte = durationMax;
  }

  // Rating filter
  if (rating) {
    query.ratingsAverage = { $gte: rating };
  }

  // Date availability filter
  if (startDate || endDate) {
    const dateQuery = {};
    if (startDate) dateQuery.$gte = new Date(startDate);
    if (endDate) dateQuery.$lte = new Date(endDate);
    query['availability.date'] = dateQuery;
  }

  // People/spots filter
  if (people) {
    query['availability.availableSpots'] = { $gte: people };
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Execute query with pagination
  const trips = await Trip.find(query)
    .populate('category', 'title')
    .sort(sort)
    .skip(skip)
    .limit(limit);

  // Get total count for pagination
  const totalTrips = await Trip.countDocuments(query);
  const totalPages = Math.ceil(totalTrips / limit);

  res.status(200).json({
    results: trips.length,
    totalResults: totalTrips,
    currentPage: page,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    data: trips,
  });
});

// @desc    Get popular destinations
// @route   GET /api/v1/trips/popular-destinations
// @access  Public
exports.getPopularDestinations = asyncHandler(async (req, res) => {
  const destinations = await Trip.aggregate([
    {
      $group: {
        _id: '$destination',
        count: { $sum: 1 },
        avgRating: { $avg: '$ratingsAverage' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        sampleTrip: { $first: '$$ROOT' }
      }
    },
    {
      $sort: { count: -1, avgRating: -1 }
    },
    {
      $limit: 10
    },
    {
      $project: {
        destination: '$_id',
        tripCount: '$count',
        averageRating: '$avgRating',
        priceRange: {
          min: '$minPrice',
          max: '$maxPrice'
        },
        sampleImage: '$sampleTrip.imageCover',
        _id: 0
      }
    }
  ]);

  res.status(200).json({
    results: destinations.length,
    data: destinations,
  });
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

// @desc    Get trip suggestions based on user preferences
// @route   POST /api/v1/trips/suggestions
// @access  Public
exports.getTripSuggestions = asyncHandler(async (req, res) => {
  const { budget, duration, interests, destination } = req.body;

  let query = {};

  // Budget filter
  if (budget) {
    query.price = { $lte: budget };
  }

  // Duration filter
  if (duration) {
    query.duration = { $lte: duration };
  }

  // Interest/type filter
  if (interests && interests.length > 0) {
    query.type = { $in: interests };
  }

  // Destination preference
  if (destination) {
    query.destination = { $regex: destination, $options: 'i' };
  }

  const suggestions = await Trip.find(query)
    .populate('category', 'title')
    .sort({ ratingsAverage: -1, ratingQuantity: -1 })
    .limit(6);

  res.status(200).json({
    results: suggestions.length,
    data: suggestions,
  });
});