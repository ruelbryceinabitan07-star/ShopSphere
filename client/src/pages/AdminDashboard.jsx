
import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";

function AdminDashboard({ token }) {
  // ORDERS
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  // PRODUCTS
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productError, setProductError] = useState("");
  const [productMessage, setProductMessage] = useState("");
  const [savingProduct, setSavingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState("");

  const initialForm = {
    name: "",
    price: "",
    category: "Fashion",
    description: "",
    image: ""
  };

  const [productForm, setProductForm] = useState(initialForm);

  const statuses = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled"
  ];

  const categories = [
    "Fashion",
    "Electronics",
    "Accessories",
    "Home & Living"
  ];

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  // FETCH ORDERS
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "http://localhost:5000/api/orders/all",
        authConfig
      );

      setOrders(response.data.orders || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to load customer orders."
      );
    } finally {
      setLoading(false);
    }
  };

  // FETCH PRODUCTS
  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      setProductError("");

      const response = await axios.get(
        "http://localhost:5000/api/products"
      );

      setProducts(response.data.products || []);
    } catch (err) {
      setProductError(
        err.response?.data?.message ||
        "Failed to load products."
      );
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
      fetchProducts();
    }
  }, [token]);

  // UPDATE ORDER STATUS
  const updateStatus = async (orderId, status) => {
    try {
      setUpdatingId(orderId);

      await axios.patch(
        `http://localhost:5000/api/orders/${orderId}/status`,
        { status },
        authConfig
      );

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order._id === orderId
            ? { ...order, status }
            : order
        )
      );
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Failed to update order status."
      );
    } finally {
      setUpdatingId("");
    }
  };

  // HANDLE PRODUCT FORM
  const handleProductChange = (e) => {
    const { name, value } = e.target;

    setProductForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  // ADD OR UPDATE PRODUCT
  const handleProductSubmit = async (e) => {
    e.preventDefault();

    try {
      setSavingProduct(true);
      setProductError("");
      setProductMessage("");

      const productData = {
        ...productForm,
        price: Number(productForm.price)
      };

      if (editingProductId) {
        await axios.put(
          `http://localhost:5000/api/products/${editingProductId}`,
          productData,
          authConfig
        );

        setProductMessage("Product updated successfully!");
      } else {
        await axios.post(
          "http://localhost:5000/api/products",
          productData,
          authConfig
        );

        setProductMessage("Product added successfully!");
      }

      setProductForm(initialForm);
      setEditingProductId("");

      await fetchProducts();
    } catch (err) {
      setProductError(
        err.response?.data?.message ||
        "Failed to save product."
      );
    } finally {
      setSavingProduct(false);
    }
  };

  // EDIT PRODUCT
  const handleEditProduct = (product) => {
    setEditingProductId(product._id);

    setProductForm({
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description,
      image: product.image
    });

    setProductMessage("");
    setProductError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // CANCEL EDIT
  const cancelEdit = () => {
    setEditingProductId("");
    setProductForm(initialForm);
    setProductError("");
    setProductMessage("");
  };

  // DELETE PRODUCT
  const handleDeleteProduct = async (productId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      setProductError("");
      setProductMessage("");

      await axios.delete(
        `http://localhost:5000/api/products/${productId}`,
        authConfig
      );

      setProductMessage("Product deleted successfully!");

      setProducts((previous) =>
        previous.filter((product) => product._id !== productId)
      );

      if (editingProductId === productId) {
        cancelEdit();
      }
    } catch (err) {
      setProductError(
        err.response?.data?.message ||
        "Failed to delete product."
      );
    }
  };

  // SALES SUMMARY
  const totalSales = orders
    .filter((order) => order.status !== "Cancelled")
    .reduce(
      (total, order) => total + Number(order.totalPrice || 0),
      0
    );

  const pendingOrders = orders.filter(
    (order) => order.status === "Pending"
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "Delivered"
  ).length;

  return (
    <section className="admin-dashboard">

      {/* ADMIN HEADING */}
      <div className="admin-heading">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage products, customer orders, and sales.</p>
        </div>

        <button
          className="admin-refresh-btn"
          onClick={() => {
            fetchOrders();
            fetchProducts();
          }}
        >
          Refresh Dashboard
        </button>
      </div>

      {/* ORDER ERROR */}
      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}

      {/* SALES STATISTICS */}
      <div className="admin-stats">

        <div className="admin-stat-card">
          <h3>Total Orders</h3>
          <h2>{orders.length}</h2>
        </div>

        <div className="admin-stat-card">
          <h3>Total Sales</h3>
          <h2>₱{totalSales.toLocaleString("en-PH")}</h2>
        </div>

        <div className="admin-stat-card">
          <h3>Pending Orders</h3>
          <h2>{pendingOrders}</h2>
        </div>

        <div className="admin-stat-card">
          <h3>Delivered Orders</h3>
          <h2>{deliveredOrders}</h2>
        </div>

      </div>

      {/* PRODUCT MANAGEMENT */}
      <div className="admin-products-container">

        <div className="admin-section-heading">
          <div>
            <h2>Product Management</h2>
            <p>Add, edit, and manage your shop products.</p>
          </div>
        </div>

        {/* PRODUCT FORM */}
        <form
          className="admin-product-form"
          onSubmit={handleProductSubmit}
        >
          <h3>
            {editingProductId ? "Edit Product" : "Add New Product"}
          </h3>

          {productError && (
            <div className="admin-error">
              {productError}
            </div>
          )}

          {productMessage && (
            <div className="admin-success">
              {productMessage}
            </div>
          )}

          <div className="admin-form-grid">

            <div className="admin-form-group">
              <label>Product Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter product name"
                value={productForm.name}
                onChange={handleProductChange}
                required
              />
            </div>

            <div className="admin-form-group">
              <label>Price (₱)</label>
              <input
                type="number"
                name="price"
                placeholder="Enter price"
                min="1"
                value={productForm.price}
                onChange={handleProductChange}
                required
              />
            </div>

            <div className="admin-form-group">
              <label>Category</label>
              <select
                name="category"
                value={productForm.category}
                onChange={handleProductChange}
                required
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-form-group">
              <label>Product Image URL</label>
              <input
                type="url"
                name="image"
                placeholder="Paste image URL"
                value={productForm.image}
                onChange={handleProductChange}
                required
              />
            </div>

            <div className="admin-form-group admin-full-width">
              <label>Description</label>
              <textarea
                name="description"
                placeholder="Enter product description"
                value={productForm.description}
                onChange={handleProductChange}
                rows="4"
                required
              />
            </div>

          </div>

          <div className="admin-form-actions">

            <button
              type="submit"
              className="admin-add-btn"
              disabled={savingProduct}
            >
              {savingProduct
                ? "Saving..."
                : editingProductId
                ? "Update Product"
                : "Add Product"}
            </button>

            {editingProductId && (
              <button
                type="button"
                className="admin-cancel-btn"
                onClick={cancelEdit}
              >
                Cancel Edit
              </button>
            )}

          </div>
        </form>

        {/* PRODUCT LIST */}
        <div className="admin-product-list">

          <h3>Existing Products ({products.length})</h3>

          {productsLoading ? (
            <p>Loading products...</p>
          ) : products.length === 0 ? (
            <p className="admin-empty">
              No products found.
            </p>
          ) : (
            <div className="admin-product-grid">

              {products.map((product) => (
                <div
                  className="admin-product-card"
                  key={product._id}
                >

                  <img
                    src={product.image}
                    alt={product.name}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://placehold.co/600x400?text=No+Image";
                    }}
                  />

                  <div className="admin-product-info">

                    <span className="admin-product-category">
                      {product.category}
                    </span>

                    <h4>{product.name}</h4>

                    <h3>
                      ₱{Number(product.price).toLocaleString("en-PH")}
                    </h3>

                    <p>{product.description}</p>

                    <div className="admin-product-actions">

                      <button
                        className="admin-edit-btn"
                        onClick={() => handleEditProduct(product)}
                      >
                        Edit
                      </button>

                      <button
                        className="admin-delete-btn"
                        onClick={() =>
                          handleDeleteProduct(product._id)
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

      </div>

      {/* CUSTOMER ORDERS */}
      <div className="admin-orders-container">

        <h2>Customer Orders</h2>

        {loading ? (
          <p className="admin-empty">
            Loading customer orders...
          </p>
        ) : orders.length === 0 ? (
          <p className="admin-empty">
            No customer orders found.
          </p>
        ) : (
          <div className="admin-table-wrapper">

            <table className="admin-orders-table">

              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Products</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Update</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>

                    <td>
                      #{order._id.slice(-8)}
                    </td>

                    <td>
                      <strong>{order.customerName}</strong>
                      <small>{order.email}</small>
                      <small>{order.phone}</small>
                    </td>

                    <td>
                      {order.items.map((item, index) => (
                        <div key={index}>
                          {item.name} × {item.quantity}
                        </div>
                      ))}
                    </td>

                    <td>
                      ₱{Number(order.totalPrice).toLocaleString("en-PH")}
                    </td>

                    <td>{order.paymentMethod}</td>

                    <td>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>

                    <td>
                      <span
                        className={`admin-status ${order.status.toLowerCase()}`}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td>
                      <select
                        value={order.status}
                        disabled={updatingId === order._id}
                        onChange={(e) =>
                          updateStatus(order._id, e.target.value)
                        }
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>

                      {updatingId === order._id && (
                        <small>Updating...</small>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>

          </div>
        )}

      </div>

    </section>
  );
}

export default AdminDashboard;
