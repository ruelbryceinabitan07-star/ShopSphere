const Product = require("../models/Product");

// GET ALL PRODUCTS
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: "Products retrieved successfully.",
      products
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve products.",
      error: error.message
    });
  }
};

// GET SINGLE PRODUCT
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found."
      });
    }

    res.status(200).json({ product });
  } catch (error) {
    res.status(400).json({
      message: "Invalid product ID."
    });
  }
};

// ADD PRODUCT
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      category,
      description,
      image
    } = req.body;

    if (
      !name?.trim() ||
      !price ||
      !category ||
      !description?.trim() ||
      !image?.trim()
    ) {
      return res.status(400).json({
        message: "Please complete all product fields."
      });
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({
        message: "Product price must be greater than zero."
      });
    }

    const product = await Product.create({
      name: name.trim(),
      price: numericPrice,
      category,
      description: description.trim(),
      image: image.trim()
    });

    res.status(201).json({
      message: "Product added successfully!",
      product
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to add product.",
      error: error.message
    });
  }
};

// UPDATE PRODUCT
exports.updateProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      category,
      description,
      image
    } = req.body;

    if (
      !name?.trim() ||
      !price ||
      !category ||
      !description?.trim() ||
      !image?.trim()
    ) {
      return res.status(400).json({
        message: "Please complete all product fields."
      });
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({
        message: "Product price must be greater than zero."
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
        price: numericPrice,
        category,
        description: description.trim(),
        image: image.trim()
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found."
      });
    }

    res.status(200).json({
      message: "Product updated successfully!",
      product
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to update product.",
      error: error.message
    });
  }
};

// DELETE PRODUCT
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found."
      });
    }

    res.status(200).json({
      message: "Product deleted successfully!"
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to delete product.",
      error: error.message
    });
  }
};