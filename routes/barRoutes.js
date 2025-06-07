const express = require("express");
const router = express.Router();
const barController = require("../controllers/barController");
const upload = require('../middlewares/upload');
const { setUploadFolder } = require("../middlewares/setUploadFolder");

router.get("/", barController.getAllItems);
router.get("/:id", barController.getItem);
router.post("/", setUploadFolder('menu'), upload.single("image"), barController.createItem);
router.put("/:id", setUploadFolder('menu'), upload.single("image"), barController.updateItem);
router.delete("/:id", barController.deleteItem);


module.exports = router;
