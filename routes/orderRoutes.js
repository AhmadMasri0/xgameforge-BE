const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { checkAdmin, checkToken } = require("../middlewares/auth");

router.post("/", checkToken, orderController.createOrder);
router.get("/", checkToken, orderController.getUserOrders);
router.get("/admin", checkToken, checkAdmin, orderController.getAllOrders);
router.put("/updateOrderDelivery/:id", checkToken, checkAdmin, orderController.updateOrderDelivery);

module.exports = router;
