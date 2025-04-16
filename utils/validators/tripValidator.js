const { check } = require("express-validator");
const slugify = require("slugify");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.getTripValidator = [
    check("id")
        .isMongoId()
        .withMessage("Invalid Trip ID format"),
    validatorMiddleware,
];

exports.createTripValidator = [
    check("title")
        .notEmpty().withMessage("Trip title is required")
        .isLength({ min: 3 }).withMessage("Trip title must be at least 3 characters")
        .custom((val, { req }) => {
            req.body.slug = slugify(val);
            return true;
        }),

    check("description")
        .notEmpty().withMessage("Description is required")
        .isLength({ max: 2000 }).withMessage("Description is too long"),
    check("itinerary").notEmpty().withMessage("itinerary is required")
        .isLength({ max: 2000, min: 5 }).withMessage("itinerary must be between 20 and 2000 char"),

    check("duration")
        .notEmpty().withMessage("Trip duration is required"),
    check("images").optional(),
    check("videos").optional(),

    check("imageCover")
        .notEmpty().withMessage("Cover image is required"),

    check("images")
        .optional()
        .isArray().withMessage("Images must be an array of strings"),

    check("videos")
        .optional(),

    check("destination")
        .optional()
        .isString().withMessage("Destination must be a string"),
    check("type").optional(),
    check("tripRoute").notEmpty().withMessage("trip route is required"),
    check("tripRoute.*.location").notEmpty().withMessage("trip route loction is required"),
    check("tripRoute.*.duration").notEmpty().withMessage("trip route loction is required"),
    check("tripRoute.*.activity").notEmpty().withMessage("trip route loction is required"),
    check("availability")
        .optional()
        .isArray().withMessage("Availability must be an array of objects"),

    check("availability.*.date")
        .optional()
        .isISO8601().withMessage("Availability date must be a valid date"),

    check("availability.*.availableSpots")
        .optional()
        .isNumeric().withMessage("Available spots must be a number"),

    check("tripLanguage").notEmpty().withMessage("trip language is required"),
    validatorMiddleware,
];

exports.updateTripValidator = [
    check("id")
        .isMongoId()
        .withMessage("Invalid Trip ID format"),
    validatorMiddleware,
];

exports.deleteTripValidator = [
    check("id")
        .isMongoId()
        .withMessage("Invalid Trip ID format"),
    validatorMiddleware,
];
