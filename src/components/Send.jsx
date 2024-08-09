import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import sendImg from '../assets/secret.svg';
import '../Send.css'; 
import axios from 'axios';

function Send() {
  const { usernamee } = useParams();
  const [message, setMessage] = useState('');
  const [messagee, setMessagee] = useState('');
  const [img, setImg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleMsg = (e) => {
    let inputText = e.target.value;
    inputText = inputText.replace('/\r?\n/g', '\n');
    setMessage(inputText);
  };

  const handleImg = (e) => {
    setLoading(true);
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      setImg(reader.result);
      setLoading(false);
    };

    reader.readAsDataURL(file);
  };

  const send = () => {
    if (message === '') {
      alert('Fill in everything, fam...');
      return;
    }

    setLoading(true);

    axios
      .post('https://wispain.vercel.app/send', {
        username: usernamee,
        message: message,
        img: img,
      })
      .then((result) => {
        setLoading(false);
        if (result.data.stat === true) {
          navigate('/sent');
        } else if (result.data.message === 'user not found') {
          setMessagee('Check link and try again');
        } else {
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
      <div className="send-form">
        <img src={sendImg} className="send-image" alt="Send" />
        <h2>WISPA TO {usernamee.toUpperCase()}</h2>

        <textarea
          className="send-textarea"
          placeholder="...Your text here"
          onChange={handleMsg}
          value={message}
        />

        <input
          type="file"
          className="send-input"
          accept="image/*"
          onChange={handleImg}
        />

        <p className="text-danger">{messagee}</p>

        {loading ? (
          <div className="loading-container">
            <div className="spinner-border text-light" role="status"></div>
          </div>
        ) : (
          <button className="send-btn" onClick={send}>
            WISPA...
          </button>
        )}
      </div>
    </div>
  );
}

export default Send;
