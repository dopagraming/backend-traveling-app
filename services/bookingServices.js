const asyncHandler = require('express-async-handler');

const Booking = require('../models/bookingModel');
const Trip = require('../models/TripModel');
const ApiError = require('../utils/apiError');

// @desc    Get list of bookings
// @route   GET /api/v1/bookings
// @access  Private/Admin-Manager
exports.getBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find();
  res.status(200).json({ data: bookings });
});

// @desc    Get specific booking by id
// @route   GET /api/v1/bookings/:id
// @access  Private/Admin-Manager-User
exports.getBooking = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const booking = await Booking.findById(id);
  
  if (!booking) {
    return next(new ApiError(`No booking for this id ${id}`, 404));
  }
  
  // Check if user is owner of booking or admin/manager
  if (req.user.role === 'user' && booking.user._id.toString() !== req.user._id.toString()) {
    return next(new ApiError(`You are not authorized to access this booking`, 403));
  }
  
  res.status(200).json({ data: booking });
});

// @desc    Create booking
// @route   POST /api/v1/bookings
// @access  Private/User
exports.createBooking = asyncHandler(async (req, res, next) => {
  // 1) Get trip and check availability
  const trip = await Trip.findById(req.body.trip);
  if (!trip) {
    return next(new ApiError(`No trip found with id ${req.body.trip}`, 404));
  }
  
  // 2) Find the selected date in availability
  const selectedDate = trip.availability.id(req.body.availabilityId);
  if (!selectedDate) {
    return next(new ApiError(`No availability found for this date`, 404));
  }
  
  // 3) Check if enough spots are available
  if (selectedDate.availableSpots < req.body.sitesBooked) {
    return next(new ApiError(`Not enough spots available for this date`, 400));
  }
  
  // 4) Create booking
  const booking = await Booking.create({
    user: req.user._id,
    trip: trip._id,
    tripName: trip.title,
    userName: req.user.name,
    userEmail: req.user.email,
    userPhone: req.user.phone,
    price: trip.price,
    totalPaid: trip.price * req.body.sitesBooked,
    sitesBooked: req.body.sitesBooked,
    bookingDate: selectedDate.date,
    paymentMethod: req.body.paymentMethod,
    notes: req.body.notes,
  });
  
  // 5) Update trip availability
  selectedDate.availableSpots -= req.body.sitesBooked;
  await trip.save();
  
  res.status(201).json({ data: booking });
});

// @desc    Update booking status
// @route   PUT /api/v1/bookings/:id
// @access  Private/Admin-Manager
exports.updateBookingStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const booking = await Booking.findByIdAndUpdate(
    id,
    { isConfirmed: req.body.isConfirmed },
    { new: true }
  );
  
  if (!booking) {
    return next(new ApiError(`No booking for this id ${id}`, 404));
  }
  
  res.status(200).json({ data: booking });
});

// @desc    Delete booking
// @route   DELETE /api/v1/bookings/:id
// @access  Private/Admin
exports.deleteBooking = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const booking = await Booking.findByIdAndDelete(id);
  
  if (!booking) {
    return next(new ApiError(`No booking for this id ${id}`, 404));
  }
  
  // If booking is deleted, update trip availability to add back the spots
  const trip = await Trip.findById(booking.trip);
  if (trip) {
    // Find the booking date in availability
    const bookingDateObj = new Date(booking.bookingDate);
    const availabilityItem = trip.availability.find(item => 
      new Date(item.date).toDateString() === bookingDateObj.toDateString()
    );
    
    if (availabilityItem) {
      availabilityItem.availableSpots += booking.sitesBooked;
      await trip.save();
    }
  }
  
  res.status(204).send();
});

// @desc    Get bookings for specific user
// @route   GET /api/v1/bookings/my-bookings
// @access  Private/User
exports.getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id });
  
  res.status(200).json({
    results: bookings.length,
    data: bookings,
  });
});