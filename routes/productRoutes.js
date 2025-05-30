const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { checkAdmin, checkToken } = require('../middlewares/auth');
const upload = require('../middlewares/upload');


router.get("/", productController.getAllProducts);
router.get("/search", productController.getSearchedProducts);
router.get("/featuredGames", productController.getFeaturedGames);
router.get("/:id", productController.getProductById);

router.post('/', upload.array('images', 5), productController.createProduct);

router.put("/:id", checkToken, checkAdmin, upload.array('images', 5), productController.updateProduct);

router.delete("/:id", checkToken, checkAdmin, productController.deleteProduct);

module.exports = router;
