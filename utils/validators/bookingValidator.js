const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const Trip = require('../../models/TripModel');
const User = require('../../models/UserModel');

exports.createBookingValidator = [
  check('trip')
    .notEmpty()
    .withMessage('Trip ID is required')
    .isMongoId()
    .withMessage('Invalid trip id format')
    .custom((tripId) =>
      Trip.findById(tripId).then((trip) => {
        if (!trip) {
          return Promise.reject(new Error(`No trip found with id: ${tripId}`));
        }
      })
    ),
  
  check('user')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('Invalid user id format')
    .custom((userId) =>
      User.findById(userId).then((user) => {
        if (!user) {
          return Promise.reject(new Error(`No user found with id: ${userId}`));
        }
      })
    ),
  
  check('price')
    .notEmpty()
    .withMessage('Booking price is required')
    .isNumeric()
    .withMessage('Booking price must be a number'),
  
  check('totalPaid')
    .notEmpty()
    .withMessage('Total paid amount is required')
    .isNumeric()
    .withMessage('Total paid must be a number'),
  
  check('sitesBooked')
    .notEmpty()
    .withMessage('Number of sites booked is required')
    .isNumeric()
    .withMessage('Sites booked must be a number')
    .isInt({ min: 1 })
    .withMessage('Sites booked must be at least 1'),
  
  check('bookingDate')
    .notEmpty()
    .withMessage('Booking date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  
  check('paymentMethod')
    .optional()
    .isIn(['credit_card', 'usdt'])
    .withMessage('Payment method must be either credit_card or usdt'),
  
  validatorMiddleware,
];

exports.getBookingValidator = [
  check('id').isMongoId().withMessage('Invalid booking id format'),
  validatorMiddleware,
];

exports.updateBookingValidator = [
  check('id').isMongoId().withMessage('Invalid booking id format'),
  
  check('isConfirmed')
    .optional()
    .isBoolean()
    .withMessage('isConfirmed must be a boolean value'),
  
  validatorMiddleware,
];

exports.deleteBookingValidator = [
  check('id').isMongoId().withMessage('Invalid booking id format'),
  validatorMiddleware,
];