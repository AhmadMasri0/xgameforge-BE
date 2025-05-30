const stripe = require('stripe')(process.env.STRIPE_SK);

exports.createPaymentIntent = async (req, res) => {
    try {
        const { cartItems } = req.body;

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ error: "Cart is empty" });
        }

        // Calculate total
        const total = cartItems.reduce((acc, item) => {
            const price = item.product?.price || 0;
            const discount = item.product?.discount || 0;
            const finalPrice = price - price * (discount / 100);
            return acc + finalPrice * item.quantity;
        }, 0);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(total * 100), // in cents
            currency: "usd",
            metadata: {
                integration_check: "accept_a_payment",
            },
        });

        res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Payment intent creation failed" });
    }
};

