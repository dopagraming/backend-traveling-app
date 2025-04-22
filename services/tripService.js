const multer = require("multer")
const TripModel = require("../models/TripModel");
const asyncHandler = require("express-async-handler")
const { deleteOne, updateOne, getOne, getGroup, createOne } = require("./handlebarsFactory");
// @desc Get List Of Trips
// @ route Get /api/v1/trips
// @access Public

exports.getAllTrips = getGroup(TripModel, "category")


// @desc Get Specific Trip
// @ route Get /api/v1/trips/:id
// @access Public

exports.getTrip = getOne(TripModel, "reviews")

const multerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/Trips')
    },
    filename: function (req, file, cb) {
        const filename = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, filename)
    }
})
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
        cb(null, true)
    } else {
        cb(new apiError("You Can Uplaode Just Images"), false)
    }
}
const upload = multer({ storage: multerStorage, fileFilter: multerFilter })
exports.uploadImagesForTrip = upload.fields[{ name: 'imageCover', maxCount: 1 }, { name: 'images', maxCount: 4 }]

// @desc Create Trip
// @ route POST /api/v1/trips
// @access Private

exports.createTrip = createOne(TripModel)

// @desc Updated Trip
// @ route Updated /api/v1/trips/:id
// @access Private

exports.updateTrip = updateOne(TripModel, "Trip", "title")

// @desc Delete Trip
// @ route Get /api/v1/trips/:id
// @access Private

exports.deleteTrip = deleteOne(TripModel)

//@desc Check availability 
//@ route post /api/v1/trips/checkavailability
//@access public

exports.checkavailability = asyncHandler(async (req, res, next) => {
    const { tripId, availabilityId, spotsRequested } = req.body;

    const trip = await TripModel.findById(tripId);
    if (!trip) {
        return res.status(404).json({ availability: false, message: "Trip not found" });
    }

    const selectedDate = trip.availability.find((e) => String(e._id) == availabilityId);
    if (!selectedDate) {
        return res.status(404).json({ availability: false, message: "Date not available" });
    }

    const availability = selectedDate.availableSpots >= spotsRequested;
    res.status(200).json({ availability, trip, selectedDate });
});

//@desc search 
//@ route post /api/v1/trips/search-trips
//@access public


exports.searching = asyncHandler(async (req, res, next) => {
    const regex = new RegExp(req.body.keyword, "i");

    const trips = await TripModel.find({
        $or: [
            { slug: { $regex: regex } },
            { title: { $regex: regex } },
            { description: { $regex: regex } },
        ],
    }).select("title");

    res.status(200).json(trips);
});