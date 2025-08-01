const express = require('express');
const {
  signup,
  login,
  forgotPassword,
  verifyPassResetCode,
  resetPassword,
  requireAuth,
  getMe,
  updatePasswordForCompanyAdmin,
  protect,
  allowedTo,
} = require('../services/authServices');

const {
  signupValidator,
  loginValidator,
} = require('../utils/validators/authValidator');

const router = express.Router();

router.post('/signup', signupValidator, signup);
router.post('/login', loginValidator, login);
router.post('/forgotPassword', forgotPassword);
router.post('/verifyResetCode', verifyPassResetCode);
router.post('/resetPassword', resetPassword);
router.get('/requireAuth', requireAuth);
router.get('/me', getMe);
router.put(
  '/:companyId/change-password',
  protect,
  allowedTo('company-admin'),
  updatePasswordForCompanyAdmin
);

module.exports = router;