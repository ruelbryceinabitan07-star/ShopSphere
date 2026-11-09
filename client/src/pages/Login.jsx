
import { useState } from "react";
import axios from "axios";
import "./Login.css";

function Login({ onRegister, onLoginSuccess }) {
  const [formData, setFormData] = useState({
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
        "http://localhost:5000/api/auth/login",
        formData
      );

      // Save login information
      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      setMessage("Login successful!");

      // Return to homepage and pass user information
      onLoginSuccess(response.data.user);

    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">

        <div className="login-header">
          <h1>Shop<span>Sphere</span></h1>
          <h2>Welcome Back!</h2>
          <p>Login to continue shopping with us.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
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
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          {message && <p>{message}</p>}
        </form>

        <p className="register-link">
          Don't have an account?{" "}
          <a
            href="#register"
            onClick={(e) => {
              e.preventDefault();
              onRegister();
            }}
          >
            Register
          </a>
        </p>

        <a href="/" className="back-home">
          ← Back to Home
        </a>

      </div>
    </div>
  );
}

export default Login;
