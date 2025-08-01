const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Trip title is required'],
      trim: true,
      minlength: [3, 'Too short trip title'],
      maxlength: [100, 'Too long trip title'],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Trip description is required'],
      minlength: [20, 'Too short trip description'],
    },
    duration: {
      type: Number,
      required: [true, 'Trip duration is required'],
    },
    price: {
      type: Number,
      required: [true, 'Trip price is required'],
      trim: true,
      min: [0, 'Price must be positive number'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    imageCover: {
      type: String,
      required: [true, 'A trip must have a cover image'],
    },
    images: [String],
    video: String,
    destination: {
      type: String,
      required: [true, 'Trip destination is required'],
    },
    type: {
      type: String,
      enum: ['adventure', 'cultural', 'relaxation', 'family', 'luxury'],
      default: 'cultural',
    },
    tripLanguage: {
      type: String,
      default: 'English',
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above or equal 1.0'],
      max: [5, 'Rating must be below or equal 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: [true, 'Trip must belong to a category'],
    },
    availability: [
      {
        date: {
          type: Date,
          required: [true, 'Availability date is required'],
        },
        availableSpots: {
          type: Number,
          required: [true, 'Available spots is required'],
        },
        spotsNumber: {
          type: Number,
          required: [true, 'Total spots number is required'],
        },
      },
    ],
    tripRoute: [
      {
        location: String,
        duration: String,
        activity: String,
        icon: String,
      },
    ],
    itinerary: [
      {
        day: String,
        description: String,
      },
    ],
    inclusions: [String],
    exclusions: [String],
    reviews: [
      {
        user: String,
        rating: Number,
        comment: String,
        date: {
          type: Date,
          default: Date.now,
        },
        country: String,
      },
    ],
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true
    },
  },

  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Mongoose query middleware
tripSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'category',
    select: 'title',
  });
  next();
});

const setImageURL = (doc) => {
  if (doc.imageCover) {
    const imageUrl = `${process.env.BASE_URL}/trips/${doc.imageCover}`;
    doc.imageCover = imageUrl;
  }
  if (doc.images) {
    const imagesList = [];
    doc.images.forEach((image) => {
      const imageUrl = `${process.env.BASE_URL}/trips/${image}`;
      imagesList.push(imageUrl);
    });
    doc.images = imagesList;
  }
};

// findOne, findAll and update
tripSchema.post('init', (doc) => {
  setImageURL(doc);
});

// create
tripSchema.post('save', (doc) => {
  setImageURL(doc);
});

const Trip = mongoose.model('Trip', tripSchema);

module.exports = Trip;