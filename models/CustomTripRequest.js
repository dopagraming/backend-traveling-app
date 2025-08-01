const mongoose = require('mongoose');

const customTripSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    destination: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    people: { type: Number, required: true },
    budget: { type: Number, required: true },
    style: { type: String, default: '' },
    mustHaves: [String],
    aiItinerary: { type: mongoose.Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CustomTripRequest', customTripSchema);