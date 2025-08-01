const asyncHandler = require('express-async-handler');
const multer = require('multer');
const path = require('path');
const Company = require('../models/Company');
const User = require('../models/UserModel');
const ApiError = require('../utils/apiError');

// Multer setup for logo uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/companies/'),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `company_${req.params.id}${ext}`);
    }
});
exports.upload = multer({ storage });

// @desc    Create new company
// @route   POST /api/v1/companies
// @access  Private (super-admin)
exports.createCompany = asyncHandler(async (req, res) => {
    const company = await Company.create(req.body);
    res.status(201).json({ data: company });
});

// @desc    Get all companies
// @route   GET /api/v1/companies
// @access  Private (super-admin)
exports.getCompanies = asyncHandler(async (req, res) => {
    const companies = await Company.find();
    res.status(200).json({ results: companies.length, data: companies });
});

// @desc    Get a single company by ID
// @route   GET /api/v1/companies/:id
// @access  Private (super-admin, company-admin)
exports.getCompany = asyncHandler(async (req, res, next) => {
    const company = await Company.findById(req.params.id);
    if (!company) return next(new ApiError('Company not found', 404));
    res.status(200).json({ data: company });
});

// @desc    Update company by ID
// @route   PUT /api/v1/companies/:id
// @access  Private (super-admin, company-admin)
exports.updateCompany = asyncHandler(async (req, res, next) => {
    const company = await Company.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );
    if (!company) return next(new ApiError('Company not found', 404));
    res.status(200).json({ data: company });
});

// @desc    Delete company by ID
// @route   DELETE /api/v1/companies/:id
// @access  Private (super-admin)
exports.deleteCompany = asyncHandler(async (req, res, next) => {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) return next(new ApiError('Company not found', 404));
    res.status(204).send();
});

// @desc    Upload or update company logo
// @route   POST /api/v1/companies/:id/logo
// @access  Private (super-admin, company-admin)
exports.uploadLogo = asyncHandler(async (req, res, next) => {
    if (!req.file) return next(new ApiError('No file uploaded', 400));
    const logoUrl = `/uploads/companies/${req.file.filename}`;
    const company = await Company.findByIdAndUpdate(
        req.params.id,
        { logoUrl },
        { new: true }
    );
    if (!company) return next(new ApiError('Company not found', 404));
    res.status(200).json({ data: { logoUrl } });
});

// @desc    Get sub-accounts for company
// @route   GET /api/v1/companies/:id/sub-accounts
// @access  Private (super-admin, company-admin)
exports.getSubAccounts = asyncHandler(async (req, res) => {
    const users = await User.find({ company: req.params.id });
    res.status(200).json({ results: users.length, data: users });
});

// @desc    Invite new sub-account
// @route   POST /api/v1/companies/:id/sub-accounts
// @access  Private (super-admin, company-admin)
exports.inviteSubAccount = asyncHandler(async (req, res, next) => {
    const { email, name, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return next(new ApiError('User already exists', 400));
    const tempPass = Math.random().toString(36).slice(-8);
    const user = await User.create({
        name,
        email,
        role,
        company: req.params.id,
        password: tempPass
    });
    req.emailOptions = {
        to: user.email,
        subject: 'You’ve been invited!',
        text: `Your temporary password is ${tempPass}. Please log in and reset it.`,
        html: `<p>Your temporary password is <strong>${tempPass}</strong>. <a href="https://yourapp.com/login">Log in</a> to get started.</p>`
    };
    next();
    res.status(201).json({ data: user });
});

// @desc    Update sub-account role
// @route   PUT /api/v1/companies/:id/sub-accounts/:userId
// @access  Private (super-admin, company-admin)
exports.updateSubAccount = asyncHandler(async (req, res, next) => {
    const { role } = req.body;
    const user = await User.findOneAndUpdate(
        { _id: req.params.userId, company: req.params.id },
        { role },
        { new: true }
    );
    if (!user) return next(new ApiError('Sub-account not found', 404));
    res.status(200).json({ data: user });
});

// @desc    Delete sub-account
// @route   DELETE /api/v1/companies/:id/sub-accounts/:userId
// @access  Private (super-admin, company-admin)
exports.deleteSubAccount = asyncHandler(async (req, res, next) => {
    const user = await User.findOneAndDelete({
        _id: req.params.userId,
        company: req.params.id
    });
    if (!user) return next(new ApiError('Sub-account not found', 404));
    res.status(204).send();
});