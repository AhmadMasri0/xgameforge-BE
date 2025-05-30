const Booking = require("../models/Booking");
const dayjs = require("dayjs");

exports.getUserBookings = async (req, res) => {

    try {
        const bookings = await Booking.find({ user: req.user._id }).sort({ date: -1 });

        const now = dayjs();

        const updatedBookings = bookings.map(booking => {
            // booking.status === "upcoming" && console.log(dayjs(`${booking.date} ${booking.startTime}`), (now))
            if (
                booking.status === "upcoming" &&
                dayjs(`${booking.date} ${booking.endTime}`).isBefore(now)
            ) {
                return { ...booking.toObject(), status: "completed" };
            }
            else if (
                booking.status === "upcoming" &&
                dayjs(`${booking.date} ${booking.startTime}`).isBefore(now) &&
                dayjs(`${booking.date} ${booking.endTime}`).isAfter(now)
            ) {
                return { ...booking.toObject(), status: "inprogress" };
            }
            return booking;
        });

        res.json(updatedBookings);
    } catch (err) {
        res.status(500).json({ message: "Failed to load bookings", error: err.message });
    }
};

const validateBookingInput = async ({ sessionType, date, startTime, endTime, userId }) => {
    if (!sessionType || !date || !startTime || !endTime) {
        return { error: "All fields are required" };
    }

    if (startTime >= endTime) {
        return { error: "Start time must be before end time" };
    }

    const endDateTime = new Date(`${date}T${endTime}`);
    const startDateTime = new Date(`${date}T${startTime}`);

    if (endDateTime <= new Date() || startDateTime <= new Date()) {
        return { error: "Please select a future date and time" };
    }

    const alreadyBooked = await Booking.findOne({
        sessionType,
        date,
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
        user: userId,
    });

    if (alreadyBooked) {
        return { error: "You already booked this session." };
    }

    const overlappingCount = await Booking.countDocuments({
        sessionType,
        date,
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
    });

    if (overlappingCount >= 4) {
        return { error: "This time slot is fully booked." };
    }

    return { available: true };
}

exports.checkAvailability = async (req, res) => {
    try {
        const { sessionType, date, startTime, endTime } = req.query;
        const userId = req.user._id;

        const validation = await validateBookingInput({ sessionType, date, startTime, endTime, userId });

        if (validation.error) {
            return res.status(400).json({ error: validation.error });
        }

        res.json({ available: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

// Create booking (POST /api/bookings)
exports.createBooking = async (req, res) => {
    try {
        const { sessionType, date, startTime, endTime } = req.body;
        const userId = req.user._id;

        const validation = await validateBookingInput({ sessionType, date, startTime, endTime, userId });

        if (validation.error) {
            return res.status(400).json({ error: validation.error });
        }

        const booking = new Booking({
            user: userId,
            sessionType,
            date,
            startTime,
            endTime,
        });

        await booking.save();
        res.status(201).json({ success: true, booking });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to book" });
    }
};


exports.cancelBooking = async (req, res) => {
    const booking = await Booking.findById(req.params.id);
    if (!booking || booking.user.toString() !== req.user._id.toString()) {
        return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = "cancelled";
    await booking.save();
    res.json({ message: "Booking cancelled", booking });
};

// Admin: get all bookings
exports.getAllBookings = async (req, res) => {
    const bookings = await Booking.find().populate("user", "username email").sort({ date: 1, startTime: 1 });

    const now = dayjs();

    const updatedBookings = bookings.map(booking => {
        if (
            booking.status === "upcoming" &&
            dayjs(`${booking.date} ${booking.endTime}`).isBefore(now)
        ) {
            return { ...booking.toObject(), status: "completed" };
        }
        else if (
            booking.status === "upcoming" &&
            dayjs(`${booking.date} ${booking.startTime}`).isBefore(now) &&
            dayjs(`${booking.date} ${booking.endTime}`).isAfter(now)
        ) {
            return { ...booking.toObject(), status: "inprogress" };
        }
        return booking;
    });

    res.status(200).json(updatedBookings);
};

// Admin: delete booking
exports.deleteBooking = async (req, res) => {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    await booking.deleteOne();
    res.status(200).json({ message: "Booking deleted successfully" });
};
