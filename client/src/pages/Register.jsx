
import { useState } from "react";
import axios from "axios";
import "./Register.css";

function Register({ onLogin }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        formData
      );

      setMessage(response.data.message || "Registration successful!");

      setFormData({
        name: "",
        email: "",
        password: ""
      });

    } catch (error) {
      setMessage(
        error.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">

        <div className="register-header">
          <h1>Shop<span>Sphere</span></h1>
          <h2>Create Account</h2>
          <p>Join ShopSphere and start shopping today!</p>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label>Email Address</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            minLength={8}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          {message && <p>{message}</p>}
        </form>

        <p className="login-link">
          Already have an account?{" "}
          <a
            href="#login"
            onClick={(e) => {
              e.preventDefault();
              onLogin();
            }}
          >
            Login
          </a>
        </p>

        <a href="/" className="back-home">
          ← Back to Home
        </a>

      </div>
    </div>
  );
}

export default Register;
