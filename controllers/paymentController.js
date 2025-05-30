const stripe = require('stripe')(process.env.STRIPE_SK);
const Product = require('../models/Product');
const Order = require('../models/Order');

// exports.createCheckoutSession = async (req, res) => {
//     const { items, userId } = req.body;

//     // Validate product stock
//     const lineItems = [];
//     const metadata = [];

//     // console.log(items)
//     for (const item of items) {
//         const product = await Product.findById(item.product._id);
//         if (!product || product.amount < item.quantity) {
//             return res.status(400).json({ error: "Product not available in requested quantity." });
//         }

//         lineItems.push({
//             price_data: {
//                 currency: 'usd',
//                 product_data: { name: product.name },
//                 unit_amount: Math.round(product.price * 100),
//             },
//             quantity: item.quantity,
//         });

//         metadata.push({
//             productId: product._id.toString(),
//             quantity: item.quantity,
//         });
//     }

//     const session = await stripe.checkout.sessions.create({
//         payment_method_types: ['card'],
//         mode: 'payment',
//         line_items: lineItems,
//         success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
//         cancel_url: `${process.env.CLIENT_URL}/cancel`,
//         metadata: {
//             userId,
//             items: JSON.stringify(metadata),
//         },
//     });
//     console.log(session)
//     res.json({ url: session.url });
// };
// exports.handleStripeWebhook = async (req, res) => {
//     let event;
//     try {
//         event = stripe.webhooks.constructEvent(
//             req.body,
//             req.headers['stripe-signature'],
//             process.env.STRIPE_WEBHOOK_SECRET
//         );
//     } catch (err) {
//         return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     if (event.type === 'checkout.session.completed') {
//         const session = event.data.object;
//         const items = JSON.parse(session.metadata.items);
//         const userId = session.metadata.userId;

//         // Create order
//         const orderItems = [];
//         for (const item of items) {
//             const product = await Product.findById(item.productId);
//             if (product) {
//                 // Decrease stock
//                 product.amount -= item.quantity;
//                 await product.save();

//                 orderItems.push({
//                     product: product._id,
//                     quantity: item.quantity,
//                     price: product.price,
//                 });
//             }
//         }

//         await Order.create({
//             user: userId,
//             items: orderItems,
//             total: session.amount_total / 100,
//             status: 'paid',
//             paymentIntentId: session.payment_intent,
//         });
//     }

//     res.sendStatus(200);
// };

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

