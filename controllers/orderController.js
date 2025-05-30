const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");

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
        const orders = await Order.find().populate("user").populate("items.product");
        res.json(orders);
    } catch (err) {
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