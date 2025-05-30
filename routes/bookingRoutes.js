const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { checkAdmin, checkToken } = require("../middlewares/auth");

// User routes
router.get("/", checkToken, bookingController.getUserBookings);
router.post("/", checkToken, bookingController.createBooking);
router.delete("/:id", checkToken, bookingController.cancelBooking);

// Availability
router.get("/check", checkToken, bookingController.checkAvailability);

// Admin routes
router.get("/all", checkToken, checkAdmin, bookingController.getAllBookings);
router.delete("/admin/:id", checkToken, checkAdmin, bookingController.deleteBooking);

module.exports = router;
