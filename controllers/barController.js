const BarItem = require("../models/BarItem");
const path = require("path");
const fs = require("fs");
const { deleteFromS3 } = require("../middlewares/deleteFromS3");

exports.getAllItems = async (req, res) => {
  try {
    const items = await BarItem.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch items", details: err });
  }
};

exports.getItem = async (req, res) => {
  try {
    const item = await BarItem.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch item", details: err });
  }
};

exports.createItem = async (req, res) => {
  try {
    const image = req.file ? req.file.location : null;
    if (!image) return res.status(400).json({ error: "Image is required" });

    const item = new BarItem({
      ...req.body,
      image,
    });

    const saved = await item.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: "Failed to create item", details: err });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const item = await BarItem.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });

    if (req.file) {

      if (item.image) {
        try {
          await deleteFromS3(item.image);
        } catch (err) {
          console.error('Error deleting old image from S3:', err);
        }
      }

      item.image = req.file.location;
    }

    Object.assign(item, req.body);

    const updated = await item.save();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Failed to update item", details: err });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const item = await BarItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });


    await deleteFromS3(item.image);

    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete item", details: err });
  }
};