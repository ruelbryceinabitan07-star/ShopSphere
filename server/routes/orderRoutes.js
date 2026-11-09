const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus
} = require("../controllers/orderController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

// CUSTOMER ROUTES
router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);

// ADMIN ROUTES
router.get("/all", protect, adminOnly, getAllOrders);

router.patch(
  "/:id/status",
  protect,
  adminOnly,
  updateOrderStatus
);

module.exports = router;