import React, { useState, useEffect } from "react";
import loginImg from "../assets/login.svg";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ForgotPassword from "./ForgotPassword"; // Import ForgotPassword
import "../login.css";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false); // State for ForgotPassword
  const navigate = useNavigate();

  const validateForm = () => {
    if (username === "" || password === "") {
      setMessage("Psst... the empty fields are looking lonely! 👀");
      return false;
    }
    return true;
  };

  const logIn = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "https://wispain.vercel.app/user/login",
        {
          username: username.toLowerCase(),
          password: password,
        }
      );

      if (response.data.stat === true) {
        localStorage.setItem("wispaToken", response.data.token);
        navigate("/get/");
      } else {
        setMessage(response.data.message);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      logIn();
    }
  };

  useEffect(() => {
    if (localStorage.wispaToken) {
      navigate("/get/");
    }
  }, [navigate]);

  return (
    <div className="login-container">
      <div className="login-form">
        {showForgotPassword ? (
          <ForgotPassword onClose={() => setShowForgotPassword(false)} />
        ) : (
          <>
            <img
              src={loginImg}
              className="login-image"
              alt="Top Secret Access"
            />
            <h2>Enter the Secret Chamber of Whispers 🤫</h2>
            <input
              type="text"
              className="login-input"
              placeholder="Your secret identity (username)"
              onChange={(e) => setUsername(e.target.value.trim())}
              onKeyPress={handleKeyPress}
            />
            <input
              type="password"
              className="login-input"
              placeholder="Your super secret password (shhh!)"
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <p className="text-danger">{message}</p>
            {loading ? (
              <div className="loading-container">
                <div className="spinner-border text-light" role="status"></div>
              </div>
            ) : (
              <button className="login-btn" onClick={logIn}>
                LOGIN
              </button>
            )}
            <a
              href="#"
              className="login-link"
              onClick={(e) => {
                e.preventDefault();
                setShowForgotPassword(true);
              }}
            >
              Memory playing hide and seek? 🙈
            </a>
            <p className="small fw-bold">
              New to Wispa?{" "}
              <a href="/create" className="login-link">
                Signup
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
