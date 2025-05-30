const mongoose = require("mongoose");

const barItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: String,
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    enum: ['Beverage', 'Snack', 'Cocktail', 'Meal', 'Other'],
    default: "Other",
  },
  image: {
    type: String, 
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("BarItem", barItemSchema);
