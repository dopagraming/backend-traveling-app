// routes/companyRouter.js
const express = require('express');
const { protect, allowedTo } = require('../services/authServices');
const {
    upload,          // multer instance
    uploadLogo,
    getSubAccounts,
    inviteSubAccount,
    updateSubAccount,
    deleteSubAccount,
    getCompanies,
    getCompany,
    updateCompany,
    deleteCompany,
    createCompany
} = require('../services/companyServices');
const { sendEmail } = require('../middlewares/emailMiddleware');

const router = express.Router();

router.post(
    '/',
    protect,
    allowedTo('super-admin'),
    createCompany
);

// Get all companies                      GET    /api/v1/companies
router.get(
    '/',
    protect,
    allowedTo('super-admin'),
    getCompanies
);

// Get single company                     GET    /api/v1/companies/:id
router.get(
    '/:id',
    protect,
    allowedTo('super-admin', 'company-admin'),
    getCompany
);

// Update a company                       PUT    /api/v1/companies/:id
router.put(
    '/:id',
    protect,
    allowedTo('super-admin', 'company-admin'),
    updateCompany
);

// Delete a company                       DELETE /api/v1/companies/:id
router.delete(
    '/:id',
    protect,
    allowedTo('super-admin'),
    deleteCompany
);

// POST   /api/v1/companies/:id/logo
router.post(
    '/:id/logo',
    protect,
    allowedTo('super-admin', 'company-admin'),
    upload.single('logo'),
    uploadLogo
);

// GET    /api/v1/companies/:id/sub-accounts
router.get(
    '/:id/sub-accounts',
    protect,
    allowedTo('super-admin', 'company-admin'),
    getSubAccounts
);

// POST   /api/v1/companies/:id/sub-accounts
router.post(
    '/:id/sub-accounts',
    protect,
    allowedTo('super-admin', 'company-admin'),
    inviteSubAccount,
    sendEmail, (req, res) => {
        res.status(201).json({ data: req.data });
    }
);

// PUT    /api/v1/companies/:id/sub-accounts/:userId
router.put(
    '/:id/sub-accounts/:userId',
    protect,
    allowedTo('super-admin', 'company-admin'),
    updateSubAccount
);

// DELETE /api/v1/companies/:id/sub-accounts/:userId
router.delete(
    '/:id/sub-accounts/:userId',
    protect,
    allowedTo('super-admin', 'company-admin'),
    deleteSubAccount
);

module.exports = router;
