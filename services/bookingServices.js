const asyncHandler = require('express-async-handler');

const Booking = require('../models/bookingModel');
const Trip = require('../models/TripModel');
const ApiError = require('../utils/apiError');

// @desc    Get all bookings (company‑scoped for non‑super-admins)
// @route   GET /api/v1/bookings
// @access  Private (super-admin, company-admin)
exports.getBookings = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role !== 'super-admin') {
    filter.company = req.user.company;
  }

  const bookings = await Booking.find(filter);
  res.status(200).json({ data: bookings });
});

// @desc    Get specific booking by id
// @route   GET /api/v1/bookings/:id
// @access  Private (super-admin, company-admin, user)  
exports.getBooking = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  // populate trip.company so we can check scope
  const booking = await Booking.findById(id).populate('trip', 'company user');
  if (!booking) {
    return next(new ApiError(`No booking for id ${id}`, 404));
  }

  // user can only see their own
  if (req.user.role === 'user') {
    if (booking.user.toString() !== req.user._id.toString()) {
      return next(new ApiError('Forbidden', 403));
    }
  }
  // company-admin can only see company bookings
  else if (req.user.role !== 'super-admin') {
    if (booking.trip.company.toString() !== req.user.company.toString()) {
      return next(new ApiError('Forbidden', 403));
    }
  }

  res.status(200).json({ data: booking });
});

// @desc    Create a booking
// @route   POST /api/v1/bookings
// @access  Private (user)
exports.createBooking = asyncHandler(async (req, res, next) => {
  const trip = await Trip.findById(req.body.trip);
  if (!trip) {
    return next(new ApiError(`No trip found with id ${req.body.trip}`, 404));
  }

  const selectedDate = trip.availability.id(req.body.availabilityId);
  if (!selectedDate) {
    return next(new ApiError('No availability for this date', 404));
  }
  if (selectedDate.availableSpots < req.body.sitesBooked) {
    return next(new ApiError('Not enough spots available', 400));
  }

  const booking = await Booking.create({
    user: req.user._id,
    trip: trip._id,
    company: trip.company,       // ← inject company
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

  // decrement availability
  selectedDate.availableSpots -= req.body.sitesBooked;
  await trip.save();

  res.status(201).json({ data: booking });
});

// @desc    Update booking status
// @route   PUT /api/v1/bookings/:id
// @access  Private (super-admin, company-admin)
exports.updateBookingStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const filter = { _id: id };
  if (req.user.role !== 'super-admin') {
    filter.company = req.user.company;
  }

  const booking = await Booking.findOneAndUpdate(
    filter,
    { isConfirmed: req.body.isConfirmed },
    { new: true }
  );
  if (!booking) {
    return next(new ApiError(`No booking for id ${id}`, 404));
  }
  res.status(200).json({ data: booking });
});

// @desc    Delete booking
// @route   DELETE /api/v1/bookings/:id
// @access  Private (super-admin, company-admin)
exports.deleteBooking = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const filter = { _id: id };
  if (req.user.role !== 'super-admin') {
    filter.company = req.user.company;
  }

  const booking = await Booking.findOneAndDelete(filter);
  if (!booking) {
    return next(new ApiError(`No booking for id ${id}`, 404));
  }

  // restore availability
  const trip = await Trip.findById(booking.trip);
  if (trip) {
    const slot = trip.availability.find(a =>
      new Date(a.date).toDateString() ===
      new Date(booking.bookingDate).toDateString()
    );
    if (slot) {
      slot.availableSpots += booking.sitesBooked;
      await trip.save();
    }
  }

  res.status(204).send();
});

// @desc    Get current user’s bookings
// @route   GET /api/v1/bookings/my-bookings
// @access  Private (user)
exports.getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id });
  res.status(200).json({
    results: bookings.length,
    data: bookings,
  });
});