const express = require('express');
const { checkoutSession } = require('../services/orderServices');

const router = express.Router();

router.post(
    '/checkout-session/:tripId',
    checkoutSession
);

module.exports = router;