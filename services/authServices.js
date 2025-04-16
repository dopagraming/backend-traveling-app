const asyncHandler = require("express-async-handler")
const UserModel = require("../models/UserModel")
const jwt = require('jsonwebtoken');
const apiError = require("../utils/apiError");
const bcrypt = require("bcryptjs")
const sendMail = require("../utils/sendMail");
const createToken = require("../utils/createToken");

// @desc    Login
// @route   GET /api/v1/auth/login
// @access  admins

exports.login = asyncHandler(async (req, res, next) => {
    // 1) check if password and email in the body (validation)
    // 2) check if user exist & check if password is correct
    const user = await UserModel.findOne({ email: req.body.email })
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
        return next(new apiError("email or passwrod incorrect !"))
    }
    // 3) generate token
    const token = createToken(user._id);
    // Delete password from response
    delete user._doc.password;
    // 4) send response to client side
    res.status(200).json({ data: user, token });
})
exports.protect = asyncHandler(async (req, res, next) => {
    // check if token exist, if exist get
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
        return next(new apiError("You are not login, please login to get access this route", 401))
    }
    // verify token (No Changes happens, expired)
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)

    // Check if user exists 
    const currentUser = await UserModel.findById(decoded.userId);
    if (!currentUser) {
        return next(new apiError("The User That belong to this token dons no longer exist"), 401)
    }
    // Password change after token created (Error)
    if (currentUser.passwordChangeAt) {
        const passwordChangedTime = parseInt(currentUser.passwordChangeAt / 1000, 10)
        if (passwordChangedTime > decoded.iat) {
            return next(new apiError("user recently Changed His Password", 401))
        }
    }
    req.user = currentUser;
    next()
})

exports.allowTo = (...roles) =>
    asyncHandler(async (req, res, next) => {
        console.log(req.user.email)
        if (!roles.includes(req.user.role)) {
            return next(new apiError("You Can't access this route", 403));
        }
        next();
    });

exports.returnUser = asyncHandler(async (req, res, next) => {
    res.status(200).json({ userName: req.user.name, useEmail: req.user.email, userRole: req.user.role })
})