import { useState, useEffect } from 'react';
import loginImg from '../assets/login.svg';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../login.css'; // Importing the custom CSS file

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.wispaToken) {
      navigate('/get/');
    }
  }, [navigate]);

  const validateForm = () => {
    if (username === '' || password === '') {
      setMessage('You know what to do.');
      return false;
    }
    return true;
  };

  const logIn = () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    axios
      .post('https://wispain.vercel.app/user/login', {
        username: username.toLowerCase(),
        password: password,
      })
      .then((result) => {
        if (result.data.stat === true) {
          localStorage.setItem('wispaToken', result.data.token);
          navigate('/get/');
        } else {
          setMessage(result.data.message);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (err.message === 'timeout of 10000ms exceeded') {
          setMessage('Timeout reached, try again.');
        } else {
          setMessage(err.message);
        }
        setLoading(false);
      });
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <img src={loginImg} className="login-image" alt="Login" />
        <h2>Login to Hear Your Whispers...</h2>
        <input
          type="text"
          className="login-input"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          className="login-input"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
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
        <p className="small fw-bold">
          New to Wispa?{' '}
          <a href="/create" className="login-link">
            Signup
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
