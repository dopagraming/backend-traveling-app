const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/UserModel');
const ApiError = require('../utils/apiError');

// Middleware to protect routes (ensure user is authenticated)
exports.protect = asyncHandler(async (req, res, next) => {
    let token;
    // 1) Get token from headers
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(new ApiError('You are not logged in! Please log in to get access.', 401));
    }

    // 2) Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
        return next(new ApiError('The user belonging to this token no longer exists.', 401));
    }

    // 4) Check if user changed password after token was issued
    if (currentUser.changedPasswordAfter && currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new ApiError('User recently changed password! Please log in again.', 401));
    }

    // Grant access
    req.user = currentUser;
    next();
});

// Middleware to restrict routes to specific roles
exports.allowedTo = (...roles) => {
    return asyncHandler(async (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ApiError('You do not have permission to perform this action.', 403));
        }
        next();
    });
};
