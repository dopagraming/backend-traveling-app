const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    trip: {
        type: mongoose.Schema.ObjectId,
        ref: 'Trip',
        required: true,
    },
    userName: {
        type: String,
        required: true,
        trim: true,
    },
    userEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    userPhone: {
        type: String,
        required: true,
    },
    sitesBooked: {
        type: Number,
        required: true,
        min: 1,
    },
    totalPaid: {
        type: Number,
        required: true,
        min: 0,
    },
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'paypal', 'bank_transfer', 'cash'],
        required: true,
    },
    isConfirmed: {
        type: Boolean,
        default: false,
    },
    notes: {
        type: String,
        default: '',
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
