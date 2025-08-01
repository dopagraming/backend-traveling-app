const nodemailer = require('nodemailer');
const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');

// Configure transporter (using environment variables)
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * Middleware to send an email.
 * Expects req.emailOptions = { to, subject, text, html }
 */
exports.sendEmail = asyncHandler(async (req, res, next) => {
    const { to, subject, text, html } = req.emailOptions || {};
    if (!to || !subject || (!text && !html)) {
        return next(new ApiError('Missing email options', 400));
    }

    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        text,
        html
    });

    next();
});
