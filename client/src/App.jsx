
import { useState } from "react";
import axios from "axios";
import "./App.css";

import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  // PRODUCTS
  const products = [
    {
      id: 1,
      name: "Running Shoes",
      price: 1499,
      category: "Fashion",
      description:
        "Comfortable and stylish running shoes for everyday use. Perfect for walking, jogging, and casual activities.",
      image:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"
    },
    {
      id: 2,
      name: "Wireless Headphones",
      price: 2299,
      category: "Electronics",
      description:
        "Wireless headphones with clear sound and comfortable ear cushions.",
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"
    },
    {
      id: 3,
      name: "Classic Watch",
      price: 1899,
      category: "Accessories",
      description:
        "A classic and elegant watch perfect for casual and formal occasions.",
      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"
    },
    {
      id: 4,
      name: "Digital Camera",
      price: 3499,
      category: "Electronics",
      description:
        "Capture your memorable moments with this digital camera.",
      image:
        "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500"
    },
    {
      id: 5,
      name: "Ceramic Vase",
      price: 899,
      category: "Home & Living",
      description:
        "A beautiful ceramic vase that adds style to your home.",
      image:
        "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=500"
    }
  ];

  // CART STATES
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  // CHECKOUT STATES
  const [showCheckout, setShowCheckout] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");
  const [completedOrder, setCompletedOrder] = useState(null);

  // MY ORDERS STATES
  const [myOrders, setMyOrders] = useState([]);
  const [showMyOrders, setShowMyOrders] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  // ADMIN DASHBOARD STATE
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  // LOGIN AND REGISTER STATES
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // CATEGORY AND PRODUCT STATES
  const [selectedCategory, setSelectedCategory] =
    useState("All Products");

  const [selectedProduct, setSelectedProduct] = useState(null);

  // CUSTOMER INFORMATION
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // CHECKOUT FORM
  const [checkoutData, setCheckoutData] = useState({
    customerName: "",
    email: "",
    phone: "",
    address: "",
    paymentMethod: "Cash on Delivery"
  });

  // CATEGORIES
  const categories = [
    "Fashion",
    "Electronics",
    "Accessories",
    "Home & Living"
  ];

  // FILTER PRODUCTS
  const filteredProducts =
    selectedCategory === "All Products"
      ? products
      : products.filter(
          (product) => product.category === selectedCategory
        );

  // CATEGORY CLICK
  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setShowMyOrders(false);
    setShowAdminDashboard(false);

    document.getElementById("products")?.scrollIntoView({
      behavior: "smooth"
    });
  };

  // ADD TO CART
  const addToCart = (product) => {
    setCart((currentCart) => {
      const existing = currentCart.find(
        (item) => item.id === product.id
      );

      if (existing) {
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentCart, { ...product, quantity: 1 }];
    });

    setCompletedOrder(null);
    setShowMyOrders(false);
    setShowAdminDashboard(false);
  };

  // REMOVE FROM CART
  const removeFromCart = (id) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== id)
    );
  };

  // UPDATE QUANTITY
  const updateQuantity = (id, amount) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setCart([]);
    setShowCart(false);
    setShowCheckout(false);
    setShowMyOrders(false);
    setShowAdminDashboard(false);
    setMyOrders([]);
    setCompletedOrder(null);

    alert("You have successfully logged out!");
  };

  // CART TOTALS
  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // OPEN CHECKOUT
  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    if (!user || !localStorage.getItem("token")) {
      alert("Please login first before checkout!");
      setShowCart(false);
      setShowLogin(true);
      return;
    }

    setCheckoutData({
      customerName: user.name || "",
      email: user.email || "",
      phone: "",
      address: "",
      paymentMethod: "Cash on Delivery"
    });

    setOrderMessage("");
    setShowCart(false);
    setShowMyOrders(false);
    setShowAdminDashboard(false);
    setShowCheckout(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // CHECKOUT FORM CHANGE
  const handleCheckoutChange = (e) => {
    setCheckoutData({
      ...checkoutData,
      [e.target.name]: e.target.value
    });
  };

  // PLACE ORDER
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      setOrderMessage("Your cart is empty.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setOrderMessage("Please login again before placing your order.");
      return;
    }

    setPlacingOrder(true);
    setOrderMessage("");

    try {
      // GET PRODUCTS FROM MONGODB
      const productsResponse = await axios.get(
        "http://localhost:5000/api/products"
      );

      const databaseProducts = Array.isArray(productsResponse.data)
        ? productsResponse.data
        : productsResponse.data.products ||
          productsResponse.data.data ||
          [];

      // MATCH CART PRODUCTS WITH MONGODB PRODUCTS
      const orderItems = cart.map((item) => {
        const databaseProduct = databaseProducts.find(
          (product) =>
            product.name?.toLowerCase() === item.name.toLowerCase()
        );

        if (!databaseProduct || !databaseProduct._id) {
          throw new Error(
            `${item.name} is not available in the database.`
          );
        }

        return {
          productId: databaseProduct._id,
          quantity: item.quantity
        };
      });

      // ORDER DATA
      const orderData = {
        customerName: checkoutData.customerName,
        email: checkoutData.email,
        phone: checkoutData.phone,
        address: checkoutData.address,
        paymentMethod: checkoutData.paymentMethod,
        items: orderItems
      };

      // SEND ORDER TO BACKEND
      const response = await axios.post(
        "http://localhost:5000/api/orders",
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setCompletedOrder(response.data.order);
      setCart([]);
      setShowCheckout(false);
      setShowCart(false);
      setShowMyOrders(false);
      setShowAdminDashboard(false);

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    } catch (error) {
      setOrderMessage(
        error.response?.data?.message ||
          error.message ||
          "Unable to place your order. Please try again."
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  // GET CUSTOMER ORDERS
  const handleMyOrders = async () => {
    const token = localStorage.getItem("token");

    if (!user || !token) {
      alert("Please login first to view your orders!");
      setShowLogin(true);
      return;
    }

    setLoadingOrders(true);
    setOrdersError("");
    setShowCart(false);
    setShowCheckout(false);
    setCompletedOrder(null);
    setShowAdminDashboard(false);
    setShowMyOrders(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    try {
      const response = await axios.get(
        "http://localhost:5000/api/orders/my-orders",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMyOrders(response.data.orders);

    } catch (error) {
      setOrdersError(
        error.response?.data?.message ||
          "Unable to load your orders."
      );
    } finally {
      setLoadingOrders(false);
    }
  };

  // OPEN ADMIN DASHBOARD
  const handleAdminDashboard = () => {
    if (!user || user.role !== "admin") {
      alert("Admin access only!");
      return;
    }

    setShowCart(false);
    setShowCheckout(false);
    setShowMyOrders(false);
    setCompletedOrder(null);
    setShowAdminDashboard(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // BACK TO SHOPPING
  const handleBackToShopping = () => {
    setShowMyOrders(false);
    setShowAdminDashboard(false);

    document.getElementById("products")?.scrollIntoView({
      behavior: "smooth"
    });
  };

  // LOGIN PAGE
  if (showLogin) {
    return (
      <Login
        onRegister={() => {
          setShowLogin(false);
          setShowRegister(true);
        }}
        onLoginSuccess={(loggedInUser) => {
          setUser(loggedInUser);
          setShowLogin(false);
        }}
      />
    );
  }

  // REGISTER PAGE
  if (showRegister) {
    return (
      <Register
        onLogin={() => {
          setShowRegister(false);
          setShowLogin(true);
        }}
      />
    );
  }

  return (
    <div className="app">

      {/* NAVBAR */}
      <nav className="navbar">
        <h2
          className="logo"
          onClick={() => {
            setShowMyOrders(false);
            setShowAdminDashboard(false);
          }}
        >
          Shop<span>Sphere</span>
        </h2>

        <div className="nav-links">
          <a
            href="#home"
            onClick={() => {
              setShowMyOrders(false);
              setShowAdminDashboard(false);
            }}
          >
            Home
          </a>

          <a
            href="#categories"
            onClick={() => {
              setShowMyOrders(false);
              setShowAdminDashboard(false);
            }}
          >
            Categories
          </a>

          <a
            href="#products"
            onClick={() => {
              setShowMyOrders(false);
              setShowAdminDashboard(false);
            }}
          >
            Products
          </a>

          <a
            href="#about"
            onClick={() => {
              setShowMyOrders(false);
              setShowAdminDashboard(false);
            }}
          >
            About
          </a>

          {user && user.role !== "admin" && (
            <button
              className="my-orders-btn"
              onClick={handleMyOrders}
            >
              My Orders
            </button>
          )}

          {user && user.role === "admin" && (
            <button
              className="admin-nav-btn"
              onClick={handleAdminDashboard}
            >
              Admin Dashboard
            </button>
          )}
        </div>

        <div className="nav-actions">
          {user ? (
            <>
              <span className="welcome-user">
                Hello, {user.name}
              </span>

              <button
                className="login-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <button
              className="login-btn"
              onClick={() => setShowLogin(true)}
            >
              Login
            </button>
          )}

          <button
            className="cart-btn"
            onClick={() => {
              setShowCart(!showCart);
              setShowCheckout(false);
              setShowMyOrders(false);
              setShowAdminDashboard(false);
            }}
          >
            🛒 Cart ({totalItems})
          </button>
        </div>
      </nav>

      {/* ADMIN DASHBOARD */}
      {showAdminDashboard && user?.role === "admin" && (
        <AdminDashboard
          token={localStorage.getItem("token")}
        />
      )}

      {/* MY ORDERS SECTION */}
      {showMyOrders && (
        <section className="my-orders-section">
          <h1>My Orders</h1>

          <p>Track and view your previous purchases.</p>

          <button
            className="back-orders-btn"
            onClick={handleBackToShopping}
          >
            ← Back to Shopping
          </button>

          {loadingOrders ? (
            <p>Loading your orders...</p>
          ) : ordersError ? (
            <p className="orders-error">{ordersError}</p>
          ) : myOrders.length === 0 ? (
            <div className="empty-orders">
              <h2>No Orders Yet</h2>
              <p>You haven't placed any orders.</p>
            </div>
          ) : (
            <div className="orders-list">
              {myOrders.map((order) => (
                <div className="order-card" key={order._id}>
                  <div className="order-header">
                    <div>
                      <h3>
                        Order #{order._id.slice(-8)}
                      </h3>

                      <p>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <span
                      className={`order-status ${order.status.toLowerCase()}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="order-customer">
                    <p>
                      <strong>Customer:</strong>{" "}
                      {order.customerName}
                    </p>

                    <p>
                      <strong>Payment:</strong>{" "}
                      {order.paymentMethod}
                    </p>

                    <p>
                      <strong>Delivery Address:</strong>{" "}
                      {order.address}
                    </p>
                  </div>

                  <div className="order-products">
                    {order.items.map((item, index) => (
                      <div className="order-product" key={index}>
                        <span>
                          {item.name} × {item.quantity}
                        </span>

                        <span>
                          ₱{(
                            item.price * item.quantity
                          ).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="order-footer">
                    <strong>
                      Total: ₱{order.totalPrice.toLocaleString()}
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* CART SUMMARY */}
      {showCart && (
        <section className="cart-summary">
          <h2>My Shopping Cart</h2>

          {cart.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <>
              {cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <span>{item.name}</span>

                  <div className="cart-quantity">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                    >
                      −
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      +
                    </button>
                  </div>

                  <span>
                    ₱{(
                      item.price * item.quantity
                    ).toLocaleString()}
                  </span>

                  <button
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}

              <h3>
                Total: ₱{totalPrice.toLocaleString()}
              </h3>

              <button
                className="checkout-btn"
                onClick={handleCheckout}
              >
                Proceed to Checkout →
              </button>
            </>
          )}
        </section>
      )}

      {/* CHECKOUT SECTION */}
      {showCheckout && (
        <section className="checkout-section">
          <h1>Checkout</h1>
          <p>Complete your information to place your order.</p>

          <div className="checkout-layout">
            <form
              className="checkout-form"
              onSubmit={handlePlaceOrder}
            >
              <h2>Customer Information</h2>

              <label>Full Name</label>
              <input
                type="text"
                name="customerName"
                placeholder="Enter your full name"
                value={checkoutData.customerName}
                onChange={handleCheckoutChange}
                required
              />

              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={checkoutData.email}
                onChange={handleCheckoutChange}
                required
              />

              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="Enter your phone number"
                value={checkoutData.phone}
                onChange={handleCheckoutChange}
                required
              />

              <label>Delivery Address</label>
              <textarea
                name="address"
                placeholder="Enter your complete delivery address"
                value={checkoutData.address}
                onChange={handleCheckoutChange}
                required
                rows="4"
              />

              <h2>Payment Method</h2>

              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Cash on Delivery"
                  checked={
                    checkoutData.paymentMethod === "Cash on Delivery"
                  }
                  onChange={handleCheckoutChange}
                />
                Cash on Delivery
              </label>

              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="GCash"
                  checked={
                    checkoutData.paymentMethod === "GCash"
                  }
                  onChange={handleCheckoutChange}
                />
                GCash
              </label>

              {orderMessage && (
                <p className="checkout-error">
                  {orderMessage}
                </p>
              )}

              <button
                type="submit"
                className="place-order-btn"
                disabled={placingOrder}
              >
                {placingOrder
                  ? "Placing Order..."
                  : "Place Order"}
              </button>

              <button
                type="button"
                className="cancel-checkout-btn"
                onClick={() => {
                  setShowCheckout(false);
                  setShowCart(true);
                }}
              >
                Back to Cart
              </button>
            </form>

            <div className="checkout-summary">
              <h2>Order Summary</h2>

              {cart.map((item) => (
                <div
                  className="checkout-item"
                  key={item.id}
                >
                  <div>
                    <h4>{item.name}</h4>
                    <p>Quantity: {item.quantity}</p>
                  </div>

                  <span>
                    ₱{(
                      item.price * item.quantity
                    ).toLocaleString()}
                  </span>
                </div>
              ))}

              <div className="checkout-total">
                <h3>Total Amount</h3>
                <h3>₱{totalPrice.toLocaleString()}</h3>
              </div>

              <p className="checkout-note">
                Please review your order before placing it.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ORDER CONFIRMATION */}
      {completedOrder && (
        <section className="order-confirmation">
          <div className="confirmation-icon">✓</div>

          <h1>Order Placed Successfully!</h1>

          <p>
            Thank you for shopping with ShopSphere.
            Your order has been saved successfully.
          </p>

          <div className="confirmation-details">
            <h2>Order Details</h2>

            <p>
              <strong>Order ID:</strong>{" "}
              {completedOrder._id}
            </p>

            <p>
              <strong>Customer:</strong>{" "}
              {completedOrder.customerName}
            </p>

            <p>
              <strong>Payment:</strong>{" "}
              {completedOrder.paymentMethod}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {completedOrder.status}
            </p>

            <div className="confirmation-items">
              {completedOrder.items.map((item, index) => (
                <div key={index}>
                  <span>
                    {item.name} × {item.quantity}
                  </span>

                  <span>
                    ₱{(
                      item.price * item.quantity
                    ).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <h3>
              Total: ₱{completedOrder.totalPrice.toLocaleString()}
            </h3>
          </div>

          <button
            className="shop-btn"
            onClick={() => {
              setCompletedOrder(null);
              setShowCheckout(false);
              setShowCart(false);
              setShowAdminDashboard(false);

              document.getElementById("products")?.scrollIntoView({
                behavior: "smooth"
              });
            }}
          >
            Continue Shopping
          </button>
        </section>
      )}

      {/* PRODUCT DETAILS MODAL */}
      {selectedProduct && (
        <div
          className="product-modal"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="product-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-modal"
              onClick={() => setSelectedProduct(null)}
            >
              ×
            </button>

            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
            />

            <h2>{selectedProduct.name}</h2>

            <p className="modal-category">
              {selectedProduct.category}
            </p>

            <h3>
              ₱{selectedProduct.price.toLocaleString()}
            </h3>

            <p>{selectedProduct.description}</p>

            <button
              className="modal-add-btn"
              onClick={() => {
                addToCart(selectedProduct);
                setSelectedProduct(null);
              }}
            >
              Add to Cart
            </button>
          </div>
        </div>
      )}

      {/* HERO */}
      <section className="hero" id="home">
        <div className="hero-content">
          <p className="subtitle">
            WELCOME TO SHOPSPHERE
          </p>

          <h1>
            Discover Your <span>Perfect</span> Style.
          </h1>

          <p>
            Shop smarter, live better. Discover amazing products
            at prices you'll love.
          </p>

          <button
            className="shop-btn"
            onClick={() => {
              setShowMyOrders(false);
              setShowAdminDashboard(false);

              document.getElementById("products")?.scrollIntoView({
                behavior: "smooth"
              });
            }}
          >
            Shop Now →
          </button>
        </div>

        <div className="hero-image">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900"
            alt="Shopping store"
          />
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="categories" id="categories">
        <h2>Shop by Category</h2>
        <p>Explore our popular collections</p>

        <div className="category-grid">
          <button
            className="category-card"
            onClick={() => handleCategoryClick("Fashion")}
          >
            👕
            <h3>Fashion</h3>
          </button>

          <button
            className="category-card"
            onClick={() => handleCategoryClick("Electronics")}
          >
            💻
            <h3>Electronics</h3>
          </button>

          <button
            className="category-card"
            onClick={() => handleCategoryClick("Accessories")}
          >
            ⌚
            <h3>Accessories</h3>
          </button>

          <button
            className="category-card"
            onClick={() => handleCategoryClick("Home & Living")}
          >
            🏠
            <h3>Home & Living</h3>
          </button>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="products" id="products">
        <h2>
          {selectedCategory === "All Products"
            ? "Featured Products"
            : selectedCategory}
        </h2>

        <p>Our best picks for you</p>

        <div className="category-filters">
          <button
            onClick={() => setSelectedCategory("All Products")}
            className={
              selectedCategory === "All Products"
                ? "active-filter"
                : ""
            }
          >
            All Products
          </button>

          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={
                selectedCategory === category
                  ? "active-filter"
                  : ""
              }
            >
              {category}
            </button>
          ))}
        </div>

        <div className="product-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div className="product-card" key={product.id}>
                <img
                  src={product.image}
                  alt={product.name}
                />

                <h3>{product.name}</h3>

                <p>
                  ₱{product.price.toLocaleString()}
                </p>

                <button
                  className="view-details-btn"
                  onClick={() => setSelectedProduct(product)}
                >
                  View Details
                </button>

                <button onClick={() => addToCart(product)}>
                  Add to Cart
                </button>
              </div>
            ))
          ) : (
            <p>No products available in this category.</p>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer id="about">
        <h2>ShopSphere</h2>

        <p>Your world of shopping, all in one place.</p>

        <p>© 2026 ShopSphere. All Rights Reserved.</p>
      </footer>

    </div>
  );
}

export default App;
