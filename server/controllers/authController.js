
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");

// CREATE NEW ORDER
exports.createOrder = async (req, res) => {
  try {
    const {
      customerName,
      email,
      phone,
      address,
      items,
      paymentMethod
    } = req.body;

    // CHECK REQUIRED INFORMATION
    if (
      !customerName?.trim() ||
      !email?.trim() ||
      !phone?.trim() ||
      !address?.trim() ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !paymentMethod
    ) {
      return res.status(400).json({
        message: "Please complete all checkout information."
      });
    }

    // CHECK PAYMENT METHOD
    if (!["Cash on Delivery", "GCash"].includes(paymentMethod)) {
      return res.status(400).json({
        message: "Invalid payment method."
      });
    }

    // VALIDATE PRODUCT IDs AND QUANTITIES
    const validItems = items.every((item) =>
      item.productId &&
      mongoose.Types.ObjectId.isValid(item.productId) &&
      Number.isInteger(Number(item.quantity)) &&
      Number(item.quantity) > 0
    );

    if (!validItems) {
      return res.status(400).json({
        message: "Invalid order items."
      });
    }

    // GET ACTUAL PRODUCTS FROM MONGODB
    const productIds = items.map((item) => item.productId);

    const products = await Product.find({
      _id: { $in: productIds }
    });

    if (products.length !== new Set(productIds.map(String)).size) {
      return res.status(400).json({
        message: "One or more products are unavailable."
      });
    }

    // CREATE ORDER ITEMS USING DATABASE PRICES
    const orderItems = items.map((item) => {
      const product = products.find(
        (p) => p._id.toString() === item.productId.toString()
      );

      return {
        productId: product._id.toString(),
        name: product.name,
        price: product.price,
        quantity: Number(item.quantity)
      };
    });

    // CALCULATE TOTAL PRICE
    const totalPrice = orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    // SAVE ORDER
    const order = await Order.create({
      user: req.user.id,
      customerName: customerName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      address: address.trim(),
      items: orderItems,
      totalPrice,
      paymentMethod
    });

    res.status(201).json({
      message: "Order placed successfully!",
      order
    });

  } catch (error) {
    console.error("Create Order Error:", error);

    res.status(500).json({
      message: "Failed to place order."
    });
  }
};


// GET CUSTOMER'S OWN ORDERS
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.id
    }).sort({ createdAt: -1 });

    res.status(200).json({
      orders
    });

  } catch (error) {
    console.error("Get My Orders Error:", error);

    res.status(500).json({
      message: "Failed to retrieve orders."
    });
  }
};


// ADMIN: GET ALL CUSTOMER ORDERS
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "All orders retrieved successfully.",
      orders
    });

  } catch (error) {
    console.error("Get All Orders Error:", error);

    res.status(500).json({
      message: "Failed to retrieve all orders."
    });
  }
};


// ADMIN: UPDATE ORDER STATUS
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled"
    ];

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid order ID."
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status."
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true
      }
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found."
      });
    }

    res.status(200).json({
      message: "Order status updated successfully!",
      order
    });

  } catch (error) {
    console.error("Update Order Status Error:", error);

    res.status(500).json({
      message: "Failed to update order status."
    });
  }
};
