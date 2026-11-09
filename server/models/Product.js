const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 1
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Fashion",
        "Electronics",
        "Accessories",
        "Home & Living"
      ]
    },
    description: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);