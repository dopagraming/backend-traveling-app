const BookingModel = require("../models/bookingModel")
const { deleteOne, updateOne, getOne, getGroup, createOne } = require("./handlebarsFactory");

// @desc Get List Of Bookings
// @ route Get /api/v1/bookings
// @access Private

exports.getAllBookings = getGroup(BookingModel, "trip")


// @desc Get Specific Booking
// @ route Get /api/v1/bookings/:id
// @access Public

exports.getBooking = getOne(BookingModel)


// @desc Create booking
// @ route POST /api/v1/bookings
// @access Private

exports.createBooking = createOne(BookingModel)

// @desc Updated Specific booking
// @ route Updated /api/v1/booking/:id
// @access Private

exports.updateBooking = updateOne(BookingModel, "Trip", "title")

// @desc Delete booking
// @ route Get /api/v1/Trips/:id
// @access Private

exports.deleteBooking = deleteOne(BookingModel)
