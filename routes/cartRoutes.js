const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { checkToken } = require("../middlewares/auth");

router.use(checkToken);

router.get("/", checkToken, cartController.getCart);
router.get("/checkcart", checkToken, cartController.checkCart);
router.post("/", checkToken, cartController.addToCart);
router.put("/", checkToken, cartController.updateItem);
router.delete("/:productId", checkToken, cartController.removeItem);
router.delete("/", checkToken, cartController.clearCart);

module.exports = router;
