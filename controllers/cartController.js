const Cart = require("../models/Cart");
const Product = require("../models/Product");

const MAX_QUANTITY = 3;

const getUserCart = async (userId) => {
    let cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart) {
        cart = new Cart({ user: userId, items: [] });
    }
    return cart;
};

exports.checkCart = async (req, res) => {

    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    return res.status(200).json(cart);
}

exports.getCart = async (req, res) => {
    try {
        const cart = await getUserCart(req.user._id);
        return res.status(200).json(cart);

    } catch (err) {
        return res.status(500).json({ message: "Error fetching cart", error: err });
    }
};

exports.addToCart = async (req, res) => {
    const { productId, quantity } = req.body;

    try {
        const product = await Product.findById(productId);
        if (!product || product.amount < 1) {
            return res.status(400).json({ message: "Out of stock" });
        }

        const cart = await getUserCart(req.user._id);
        const itemIndex = cart.items.findIndex(i => i.product._id.toString() === productId);

        if (itemIndex > -1) {
            const currentQty = cart.items[itemIndex].quantity;
            cart.items[itemIndex].quantity = Math.min(product.amount, MAX_QUANTITY, currentQty + quantity);
        } else {
            cart.items.push({ product, quantity: Math.min(quantity, MAX_QUANTITY) });
        }

        await cart.save();
        return res.status(200).json(cart);
    } catch (err) {
        return res.status(500).json({ message: "Error adding to cart", error: err });
    }

};

exports.updateItem = async (req, res) => {
    const { productId, quantity } = req.body;

    try {
        const cart = await getUserCart(req.user._id);
        const item = cart.items.find(i => i.product._id.toString() === productId);
        if (!item) return res.status(404).json({ message: "Item not found" });

        const product = await Product.findById(productId);
        if (!product || product.amount < 1) {
            return res.status(400).json({ message: "Out of stock" });
        }

        const currentQty = item.quantity;
        item.quantity = Math.min(product.amount, MAX_QUANTITY, quantity);

        await cart.save();
        return res.status(200).json(cart);
    } catch (err) {
        return res.status(500).json({ message: "Error updating cart", error: err });
    }
};

exports.removeItem = async (req, res) => {
    const { productId } = req.params;

    try {
        const cart = await getUserCart(req.user._id);
        cart.items = cart.items.filter(i => i.product._id.toString() !== productId);
        await cart.save();
        return res.status(200).json(cart);
    } catch (err) {
        return res.status(500).json({ message: "Error removing item", error: err });
    }

};

exports.clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        cart.items = [];
        await cart.save();
        return res.status(200).json(cart);
    } catch (err) {
        return res.status(500).json({ message: "Error clearing cart", error: err });
    }

};
