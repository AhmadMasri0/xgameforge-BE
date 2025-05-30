const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
});

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    items: [orderItemSchema],
    orderDetail: {
        type: {
            fullName: { type: String, required: true },
            email: { type: String, required: true },
            phone: { type: String, required: true },
            address: { type: String, required: true },
            city: { type: String, required: true },
            zip: { type: String, required: true },
            notes: { type: String, },
        },
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["unpaid", "paid", "cancelled"],
        default: "unpaid",
    },
    paymentIntentId: String,
    isDelivered: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
