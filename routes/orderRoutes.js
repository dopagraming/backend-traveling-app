const express = require('express');
const {
  createCheckoutSession,
  webhookCheckout,
} = require('../services/orderServices');

const { protect } = require('../services/authServices');

const router = express.Router();

// Stripe webhook
router.post('/webhook-checkout', express.raw({ type: 'application/json' }), webhookCheckout);

// Protected routes
router.use(protect);

router.post('/checkout-session/:tripId', createCheckoutSession);

module.exports = router;