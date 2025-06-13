const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Booking must belong to a user'],
    },
    trip: {
      type: mongoose.Schema.ObjectId,
      ref: 'Trip',
      required: [true, 'Booking must belong to a trip'],
    },
    tripName: String,
    userName: String,
    userEmail: String,
    userPhone: String,
    price: {
      type: Number,
      required: [true, 'Booking must have a price'],
    },
    totalPaid: {
      type: Number,
      required: [true, 'Booking must have a total paid amount'],
    },
    sitesBooked: {
      type: Number,
      required: [true, 'Booking must have number of sites booked'],
      min: 1,
    },
    bookingDate: {
      type: Date,
      required: [true, 'Booking must have a date'],
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'usdt'],
      default: 'credit_card',
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Populate user and trip when finding bookings
bookingSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name email phone',
  }).populate({
    path: 'trip',
    select: 'title imageCover price',
  });
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;