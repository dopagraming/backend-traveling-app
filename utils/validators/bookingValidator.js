const { check } = require('express-validator');

exports.createBookingValidator = [
    check('trip')
        .notEmpty().withMessage('Trip ID is required')
        .isMongoId().withMessage('Trip ID must be a valid Mongo ID'),

    check('userName')
        .notEmpty().withMessage('User name is required')
        .isLength({ min: 2 }).withMessage('User name must be at least 2 characters'),

    check('userEmail')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Must be a valid email'),

    check('userPhone')
        .notEmpty().withMessage('Phone number is required')
        .isMobilePhone().withMessage('Must be a valid phone number'),

    check('sitesBooked')
        .notEmpty().withMessage('Number of sites booked is required')
        .isInt({ min: 1 }).withMessage('Must be at least 1 site'),

    check('totalPaid')
        .notEmpty().withMessage('Total paid is required')
        .isFloat({ min: 0 }).withMessage('Total paid must be 0 or more'),

    check('paymentMethod')
        .notEmpty().withMessage('Payment method is required')
        .isIn(['credit_card', 'paypal', 'bank_transfer', 'cash'])
        .withMessage('Invalid payment method'),

    check('isConfirmed')
        .optional()
        .isBoolean().withMessage('isConfirmed must be true or false'),

    check('notes')
        .optional()
        .isString().withMessage('Notes must be text'),
];
