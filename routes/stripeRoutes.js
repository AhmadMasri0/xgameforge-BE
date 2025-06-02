const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { checkToken } = require('../middlewares/auth');


router.post('/create-payment-intent', checkToken, paymentController.createPaymentIntent);

module.exports = router;
