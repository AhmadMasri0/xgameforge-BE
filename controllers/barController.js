const BarItem = require("../models/BarItem");
const path = require("path");
const fs = require("fs");

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
    const image = req.file ? `/uploads/${req.file.filename}` : null;
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
      const oldImage = path.join(__dirname, "..", item.image);
      if (fs.existsSync(oldImage)) fs.unlinkSync(oldImage);
      item.image = `/uploads/${req.file.filename}`;
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

    const imagePath = path.join(__dirname, "..", item.image);
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete item", details: err });
  }
};