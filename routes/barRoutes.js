const express = require("express");
const router = express.Router();
const barController = require("../controllers/barController");
const multer = require("multer");
const path = require("path");
const upload = require('../middlewares/upload')

// Routes
router.get("/", barController.getAllItems);
router.get("/:id", barController.getItem);
router.post("/", upload.single("image"), barController.createItem);
router.put("/:id", upload.single("image"), barController.updateItem);
router.delete("/:id", barController.deleteItem);

module.exports = router;
