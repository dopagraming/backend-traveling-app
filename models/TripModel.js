const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Trip title is required"],
        minlength: [3, "Trip title must be at least 3 characters"],
        maxlength: [100, "Trip title can't exceed 100 characters"],
        trim: true
    },
    slug: {
        type: String,
        required: true,
        lowercase: true
    },
    price: {
        type: Number,
        required: [true, "trip price required"],
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        maxlength: [2000, "Description is too long"]
    },
    itinerary: {
        type: [String],
        maxlength: [200, "Itinerary is too long"],
        required: [true, "itinerary is required"]
    },
    duration: {
        type: String,
        trim: true
    },
    images: [String],
    imageCover: {
        type: String,
        required: [true, "Cover image is required"]
    },
    videos: String,
    destination: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        default: 'Adventure'
    },
    tripRoute: [
        {
            location: {
                type: String,
                required: [true, "loction is required"]
            },
            duration: String,
            activity: String,
            icon: String
        }
    ],
    availability: [
        {
            date: {
                type: Date,
                required: [true, "Date is required"]
            },
            availableSpots: {
                type: Number,
            },
            spotsNumber: {
                type: Number,
                required: [true, "spots number is required"],
                min: [1, "spots number must be at least 1"]
            }
        }
    ],
    reviews: [
        {
            user: String,
            rating: {
                type: Number,
                min: 1,
                max: 5
            },
            comment: String,
            date: {
                type: Date,
                default: Date.now
            }
        }
    ],
    ratingsAverage: {
        type: Number,
        min: [1, 'Rating Must Be Above Or Equal 1.0'],
        max: [5, "Rating Must Be Below Or Equal 5.0"]
    },
    ratingQuantity: {
        type: Number,
        default: 0
    },

    tripLanguage: String
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

module.exports = mongoose.models.Trip || mongoose.model('Trip', tripSchema);
