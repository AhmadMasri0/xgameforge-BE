const Cart = require("../models/Cart");
const Product = require("../models/Product");

const MAX_QUANTITY = 3;

// Helper: Find or create a user cart
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

// GET /api/cart
exports.getCart = async (req, res) => {
    try {
        // if (req.user) {
        const cart = await getUserCart(req.user._id);
        return res.status(200).json(cart);
        // }

        // const cart = req.session.cart || { items: [] };
        // return res.status(200).json(cart);
    } catch (err) {
        return res.status(500).json({ message: "Error fetching cart", error: err });
    }
};

// POST /api/cart
exports.addToCart = async (req, res) => {
    const { productId, quantity } = req.body;

    // if (req.user) {
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
    // }
    // Guest logic
    // req.session.cart = req.session.cart || { items: [] };
    // console.log('req.session.cart')
    // const guestItem = req.session.cart.items.find(i => i.product === productId);

    // if (guestItem) {
    //     guestItem.quantity = Math.min(MAX_QUANTITY, guestItem.quantity + quantity);
    // } else {
    //     req.session.cart.items.push({ product: productId, quantity: Math.min(quantity, MAX_QUANTITY) });
    // }

    // return res.status(200).json(req.session.cart);
};

// PUT /api/cart
exports.updateItem = async (req, res) => {
    const { productId, quantity } = req.body;

    // if (req.user) {
    try {
        const cart = await getUserCart(req.user._id);
        const item = cart.items.find(i => i.product._id.toString() === productId);
        if (!item) return res.status(404).json({ message: "Item not found" });

        const product = await Product.findById(productId);
        if (!product || product.amount < 1) {
            return res.status(400).json({ message: "Out of stock" });
        }

        const currentQty = item.quantity;
        item.quantity = Math.min(product.amount, MAX_QUANTITY, currentQty + quantity);

        // item.quantity = Math.min(quantity, MAX_QUANTITY);
        await cart.save();
        return res.status(200).json(cart);
    } catch (err) {
        return res.status(500).json({ message: "Error updating cart", error: err });
    }
    // }

    // Guest
    // if (!req.session.cart) return res.status(404).json({ message: "Cart not found" });

    // const item = req.session.cart.items.find(i => i.product === productId);
    // if (!item) return res.status(404).json({ message: "Item not found" });

    // item.quantity = Math.min(quantity, MAX_QUANTITY);
    // return res.status(200).json(req.session.cart);
};

// DELETE /api/cart/:productId
exports.removeItem = async (req, res) => {
    const { productId } = req.params;

    // if (req.user) {
    try {
        const cart = await getUserCart(req.user._id);
        cart.items = cart.items.filter(i => i.product._id.toString() !== productId);
        await cart.save();
        return res.status(200).json(cart);
    } catch (err) {
        return res.status(500).json({ message: "Error removing item", error: err });
    }
    // }

    // if (!req.session.cart) return res.status(404).json({ message: "Cart not found" });

    // req.session.cart.items = req.session.cart.items.filter(i => i.product !== productId);
    // return res.status(200).json(req.session.cart);
};

// DELETE /api/cart
exports.clearCart = async (req, res) => {
    // if (req.user) {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        cart.items = [];
        await cart.save();
        return res.status(200).json(cart);
    } catch (err) {
        return res.status(500).json({ message: "Error clearing cart", error: err });
    }
    // }

    // req.session.cart = { items: [] };
    // return res.status(200).json(req.session.cart);
};
