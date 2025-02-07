import { useState, useEffect, useCallback } from "react";
import signupImg from "../assets/signup.svg";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code"; // Changed import
import "../Signup.css";

function Signup() {
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.wispaToken) {
      navigate("/get/");
    }
  }, [navigate]);

  const validateForm = useCallback(() => {
    if (username === "" || password === "" || confirmPassword === "") {
      setMessage("Please fill in all fields.");
      return false;
    }
    if (password !== confirmPassword) {
      setMessage("Passwords don't match.");
      return false;
    }
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      setMessage(
        "Username must be 3-20 characters and can only contain letters, numbers, and underscores."
      );
      return false;
    }
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters long.");
      return false;
    }
    return true;
  }, [username, password, confirmPassword]);

  const signUp = () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    axios
      .post("https://wispain.vercel.app/user/create", {
        username: username.toLowerCase(),
        password: password,
      })
      .then((result) => {
        if (result.data.stat === true) {
          localStorage.setItem("wispaToken", result.data.token);
          navigate("/get/");
        } else {
          setMessage(result.data.message);
        }
        setLoading(false);
      })
      .catch((err) => {
        setMessage(err.message);
        setLoading(false);
      });
  };

  return (
    <div className="signup-container">
      <div className="signup-form">
        <img src={signupImg} alt="Sign Up" className="signup-image" />
        <h2 className="mb-4">Sign Up to Whisper</h2>
        <input
          type="text"
          className="form-control mb-3 signup-input"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          className="form-control mb-3 signup-input"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          className="form-control mb-3 signup-input"
          placeholder="Confirm Password"
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <p className="text-danger mb-3">{message}</p>
        {loading ? (
          <div className="form-control loading-container">
            <div className="spinner-border text-light" role="status"></div>
          </div>
        ) : (
          <button className="btn btn-block signup-btn" onClick={signUp}>
            SIGN UP
          </button>
        )}
        {username && (
          <QRCode // Using the new import
            value={`https://wispah.vercel.app/send/${username}`}
            size={256}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            bgColor="#ffffff"
            fgColor="#000000"
            level="H"
          />
        )}
        <p className="small fw-bold mt-4">
          Already have an account?{" "}
          <a href="/" className="login-link">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}

export default Signup;
