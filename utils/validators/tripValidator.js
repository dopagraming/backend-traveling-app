const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const Category = require('../../models/CategoryModel');

exports.createTripValidator = [
  check('title')
    .notEmpty()
    .withMessage('Trip title is required')
    .isLength({ min: 3 })
    .withMessage('Too short trip title')
    .isLength({ max: 100 })
    .withMessage('Too long trip title'),
  
  check('description')
    .notEmpty()
    .withMessage('Trip description is required')
    .isLength({ min: 20 })
    .withMessage('Too short trip description'),
  
  check('duration')
    .notEmpty()
    .withMessage('Trip duration is required')
    .isNumeric()
    .withMessage('Trip duration must be a number'),
  
  check('price')
    .notEmpty()
    .withMessage('Trip price is required')
    .isNumeric()
    .withMessage('Trip price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Trip price must be positive number'),
  
  check('priceDiscount')
    .optional()
    .isNumeric()
    .withMessage('Trip price discount must be a number')
    .custom((value, { req }) => {
      if (value >= req.body.price) {
        throw new Error('Discount price must be below regular price');
      }
      return true;
    }),
  
  check('imageCover').notEmpty().withMessage('Trip image cover is required'),
  
  check('images')
    .optional()
    .isArray()
    .withMessage('Images should be array of strings'),
  
  check('destination')
    .notEmpty()
    .withMessage('Trip destination is required'),
  
  check('type')
    .optional()
    .isIn(['adventure', 'cultural', 'relaxation', 'family', 'luxury'])
    .withMessage('Trip type must be one of: adventure, cultural, relaxation, family, luxury'),
  
  check('category')
    .notEmpty()
    .withMessage('Trip must belong to a category')
    .isMongoId()
    .withMessage('Invalid category id format')
    .custom((categoryId) =>
      Category.findById(categoryId).then((category) => {
        if (!category) {
          return Promise.reject(
            new Error(`No category for this id: ${categoryId}`)
          );
        }
      })
    ),
  
  check('availability')
    .optional()
    .isArray()
    .withMessage('Availability should be array of objects'),
  
  check('tripRoute')
    .optional()
    .isArray()
    .withMessage('Trip route should be array of objects'),
  
  check('itinerary')
    .optional()
    .isArray()
    .withMessage('Itinerary should be array of objects'),
  
  check('inclusions')
    .optional()
    .isArray()
    .withMessage('Inclusions should be array of strings'),
  
  check('exclusions')
    .optional()
    .isArray()
    .withMessage('Exclusions should be array of strings'),
  
  validatorMiddleware,
];

exports.getTripValidator = [
  check('id').isMongoId().withMessage('Invalid trip id format'),
  validatorMiddleware,
];

exports.updateTripValidator = [
  check('id').isMongoId().withMessage('Invalid trip id format'),
  check('title')
    .optional()
    .isLength({ min: 3 })
    .withMessage('Too short trip title')
    .isLength({ max: 100 })
    .withMessage('Too long trip title'),
  
  check('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid category id format')
    .custom((categoryId) =>
      Category.findById(categoryId).then((category) => {
        if (!category) {
          return Promise.reject(
            new Error(`No category for this id: ${categoryId}`)
          );
        }
      })
    ),
  
  validatorMiddleware,
];

exports.deleteTripValidator = [
  check('id').isMongoId().withMessage('Invalid trip id format'),
  validatorMiddleware,
];