const express = require("express")
const { getAllBookings, createBooking, getBooking, deleteBooking, updateBooking } = require("../services/bookingServices")
const { createBookingValidator } = require("../utils/validators/bookingValidator")
const router = express.Router()


router.route('/').get(getAllBookings)
    .post(createBookingValidator, createBooking)
router.route("/:id")
    .get(getBooking)
    .delete(deleteBooking)
    .put(updateBooking)

module.exports = router