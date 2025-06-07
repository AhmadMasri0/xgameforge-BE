const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { checkAdmin, checkToken } = require("../middlewares/auth");

router.get("/", checkToken, bookingController.getUserBookings);
router.get("/check", checkToken, bookingController.checkAvailability);
router.get("/all", checkToken, checkAdmin, bookingController.getAllBookings);
router.post("/", checkToken, bookingController.createBooking);
router.delete("/cancel/:id", checkToken, bookingController.cancelBooking);
router.delete("/admin/cancel/:id", checkToken, checkAdmin, bookingController.cancelBookingByAdmin);
router.delete("/admin/delete/:id", checkToken, checkAdmin, bookingController.deleteBooking);

module.exports = router;
