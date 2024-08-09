import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import html2canvas from 'html2canvas';
import '../Messages.css';

function Messages() {
  const [username, setUsername] = useState("...");
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();
  const cardRef = useRef(null);

  const token = localStorage.getItem("wispaToken");

  useEffect(() => {
    if (token) {
      axios.post('https://wispain.vercel.app/get', { token })
        .then((result) => {
          if (result.data) {
            setUsername(result.data.username.toLowerCase());
            if (result.data.message !== "nothing") {
              setMessages(result.data.message);
            }
          }
        })
        .catch((err) => console.error(err));
    } else {
      navigate('/');
    }
  }, [token, navigate]);

  const logOut = () => {
    localStorage.removeItem("wispaToken");
    navigate('/');
  };

  const copy = () => {
    navigator.clipboard.writeText(`ready, set, vent! 💀\nsend me an anonymous message, get everything off your chest, you can add an image for context or proof, if you dare. let's get real!! 🤐 \nwispah.vercel.app/send/${username}`);
    alert("Copied!");
  };

  const downloadCard = (index) => {
    const card = cardRef.current.children[index + 1];
    const button = card.querySelector('.download-button');
    const generatedText = document.createElement('p');

    generatedText.className = 'generated-text';
    generatedText.innerText = `Generated from Wispa,\nOne of ${(username).toUpperCase()}'s Wispas.`;
    card.querySelector('.message-content').appendChild(generatedText);

    // Hide the download button
    button.style.display = 'none';

    setTimeout(() => {
      html2canvas(card, { useCORS: true }).then(canvas => {
        const link = document.createElement('a');
        link.download = `message_${index}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        // Show the download button again and remove the generated text after the download
        button.style.display = 'block';
        card.querySelector('.message-content').removeChild(generatedText);
      });
    }, 500); // Slight delay to ensure image is fully loaded
  };

  return (
    <>
      <div className='w-100 justify-content-center d-flex'>
        <div className="w-100 header-card text-light p-5">
          {username !== "..." && (
            <>
              <p>Welcome, {username.toUpperCase()}.</p>
              <p>Here is your link: <a href={`/send/${username}`}>wispah.vercel.app/send/{username}</a></p>
              <button className='btn btn-outline-light copy-button' onClick={copy}>Copy with content</button>
            </>
          )}
        </div>
      </div>

      <div className="messages-container" ref={cardRef}>
        <p className="instructions">TAP ON ANY IMAGE TO ACCESS FULL SIZE</p>

        {messages.map((message, index) => (
          <div className="message-box" key={index}>
            {message.imageURL && (
              <div className="message-image-container">
                <img
                  src={message.imageURL}
                  alt="Attached"
                  className="message-image"
                  onClick={() => window.location.href = message.imageURL}
                />
              </div>
            )}
            <div className="message-content">
              <hr className="divider" />
              <div className="quote-container">
                <span className="quote-mark">“</span>
                <pre className="message-text">{message.message}</pre>
                <span className="quote-mark">”</span>
              </div>
              <p className="message-date">{new Date(message.time).toLocaleString()}</p>
              <button className="btn w-100 btn-sm btn-outline-light mt-2 text-center download-button" onClick={() => downloadCard(index)}>Download Card</button>
            </div>
          </div>
        ))}
      </div>
      <div className='mx-auto text-center'>
        <button className="btn mt-4 mb-5 w-75 logout-button" onClick={logOut}>LOGOUT</button>
      </div>
    </>
  );
}

export default Messages;
