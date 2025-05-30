const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { checkAdmin, checkToken } = require('../middlewares/auth');

// router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleStripeWebhook);

router.post('/create-payment-intent', checkToken, paymentController.createPaymentIntent);

module.exports = router;
