import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Send.css';
import sendImg from "../assets/secret.svg";

const MAX_MESSAGE_LENGTH = 5000;

function Send() {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { username } = useParams();
  const navigate = useNavigate();

  const handleMsg = (e) => {
    setMessage(e.target.value);
    setError('');
  };

  
  const handleImg = (e) => {
    setLoading(true);
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      setImage(reader.result);
      setLoading(false);
    };

    reader.readAsDataURL(file);
  };


  const send = async () => {
      const datee = new Date();
    const date = datee.toISOString();
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    setLoading(true);
      axios
        .post("https://wispain.vercel.app/send", {
          username: username,
          message: message,
          img: image,
          time: date,
        })
        .then((result) => {
          setLoading(false);
          if (result.data.stat === true) {
            navigate("/sent");
          } else if (result.data.message === "user not found") {
          setLoading(false);

            setMessagee("Check link and try again");
          } else {
          setLoading(false);

            setMessagee(result.data.message);
          }
        })
        .catch((err) => {
          setLoading(false);
          setMessagee(err.message);
        });
  };

  return (
    <div className="send-container">
        <img
          src={sendImg}
          className="send-image"
          alt="Super Secret Sending Device"
        />

      <div className="send-form">
      <h1>Send a Wispa to {username?.toUpperCase()}</h1>
        <textarea
          className="send-textarea"
          placeholder="Type your secret here... Don't worry, we won't tell anyone (except them 😉)"
          onChange={handleMsg}
          value={message}
          maxLength={MAX_MESSAGE_LENGTH}
        />
        <p className="char-count">
          {message.length}/{MAX_MESSAGE_LENGTH} characters used
          {message.length === MAX_MESSAGE_LENGTH && " (Whoa there, Shakespeare! 📚)"}
        </p>

        <input
          type="file"
          className="send-input"
          accept="image/*"
          onChange={handleImg}
        />
        <p className="">
          Add an image (worth a thousand whispers 📸)
        </p>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <div className="spinner-border text-light" role="status"></div>
            <p>Sending your tea... ☕</p>
          </div>
        ) : (
          <button className="send-btn" onClick={send}>
            WISPA (like a ninja) 🥷
          </button>
        )}
      </div>
    </div>
  );
}

export default Send;
