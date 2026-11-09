const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product");

dotenv.config();

const products = [
  {
    name: "Running Shoes",
    price: 1499,
    category: "Fashion",
    description:
      "Comfortable and stylish running shoes for everyday use. Perfect for walking, jogging, and daily activities.",
    image: "https://placehold.co/600x400?text=Running+Shoes"
  },
  {
    name: "Wireless Headphones",
    price: 2299,
    category: "Electronics",
    description:
      "High-quality wireless headphones with clear sound and comfortable ear cushions.",
    image: "https://placehold.co/600x400?text=Wireless+Headphones"
  },
  {
    name: "Classic Watch",
    price: 1899,
    category: "Accessories",
    description:
      "A classic and elegant watch suitable for everyday wear and special occasions.",
    image: "https://placehold.co/600x400?text=Classic+Watch"
  },
  {
    name: "Digital Camera",
    price: 3499,
    category: "Electronics",
    description:
      "Capture your favorite moments with this easy-to-use digital camera.",
    image: "https://placehold.co/600x400?text=Digital+Camera"
  },
  {
    name: "Ceramic Vase",
    price: 899,
    category: "Home & Living",
    description:
      "A beautiful ceramic vase that adds style to your home decoration.",
    image: "https://placehold.co/600x400?text=Ceramic+Vase"
  }
];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const count = await Product.countDocuments();

    if (count > 0) {
      console.log("Products already exist. Seeding skipped.");
    } else {
      await Product.insertMany(products);
      console.log("Five sample products added successfully!");
    }
  } catch (error) {
    console.error("Seeding Error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

seedProducts();