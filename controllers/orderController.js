const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const stripe = require('stripe')(process.env.STRIPE_SK);

exports.createOrder = async (req, res) => {
    try {
        const { cartItems, totalAmount, paymentIntentId, orderDetail, status } = req.body;
        const userId = req.user._id;

        for (const item of cartItems) {
            const product = await Product.findById(item.product._id);
            if (!product || product.amount < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${product?.name || 'a product'}` });
            }
            product.amount -= item.quantity;
            await product.save();
        }

        const cart = await Cart.findOne({ user: req.user._id });
        cart.items = [];
        await cart.save();

        const newOrder = new Order({
            user: userId,
            orderDetail,
            items: cartItems,
            totalAmount,
            paymentIntentId,
            status,
        });

        await newOrder.save();
        res.status(201).json({ success: true, order: newOrder });
    } catch (err) {
        console.error("Order creation failed:", err);
        res.status(500).json({ message: "Failed to create order", error: err.message });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).populate("items.product");
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch orders", error: err.message });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const { search = "", status = "", page = 1, isDelivered } = req.query;
        const limit = 5;
        const skip = (page - 1) * limit;

        let filter = {};

        if (search) {
            const regex = new RegExp(search, "i");
            filter.$or = [
                { _id: search.match(/^[0-9a-fA-F]{24}$/) ? search : undefined },
                { "orderDetail.email": regex }
            ];
        }

        if (status) {
            filter.status = status;
        }

        if (isDelivered) {
            filter.isDelivered = isDelivered;
        }

        const total = await Order.countDocuments(filter);
        const orders = await Order.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("user", "name email")
            .populate("items.product");

        res.json({ orders, totalPages: Math.ceil(total / limit) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch orders", error: err.message });
    }
};

exports.updateOrderDelivery = async (req, res) => {
    try {

        const orderId = req.params.id;

        const order = await Order.findById(orderId).populate("items.product");
        if (!order) {
            res.status(400).json({ message: "Order not found", error: err.message });
        }
        order.isDelivered = true;
        order.status = 'paid';
        order.save();
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: "Failed to update order", error: err.message });
    }
};

exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });

        if (order.status === "cancelled" || order.isDelivered) {
            return res.status(400).json({ message: "Cannot cancel this order" });
        }

        if (order.paymentIntentId) {
            // Refund through Stripe
            await stripe.refunds.create({ payment_intent: order.paymentIntentId });
        }

        // Restore product stock (if needed)
        for (let item of order.items) {
            const product = await Product.findById(item.product);
            if (product) {
                product.amount += item.quantity;
                await product.save();
            }
        }

        order.status = "cancelled";
        await order.save();

        res.json({ message: "Order cancelled and refunded", order });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Cancellation failed", error: err.message });
    }
};
