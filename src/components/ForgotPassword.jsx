import React, { useState } from "react";
import axios from "axios";

const ForgotPassword = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setMessage("");
    setLoading(true);
    try {
      const response = await axios.post(
        "https://wispain.vercel.app/user/forgot-password",
        { email, username }
      );
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>Forgot Password</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="login-input"
      />
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="login-input"
      />
      <p className="text-danger">{message}</p>
      {loading ? (
        <div className="loading-container">
          <div className="spinner-border text-light" role="status"></div>
        </div>
      ) : (
        <button className="login-btn" onClick={handleSubmit}>
          Reset Password
        </button>
      )}
      <button className="login-link" onClick={onClose}>
        Back to Login
      </button>
    </div>
  );
};

export default ForgotPassword;
