const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    sessionType: {
        type: String,
        enum: ["PlayStation", "VR", "PC", "Console", "Other"],
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    startTime: {
        type: String,
        required: true,
    },
    endTime: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["upcoming", "completed", "cancelled", "inprogress"],
        default: "upcoming",
    },
    notes: String,
}, {
    timestamps: true,
});

bookingSchema.index({ sessionType: 1, date: 1, startTime: 1, endTime: 1 }, { unique: false });

module.exports = mongoose.model("Booking", bookingSchema);
