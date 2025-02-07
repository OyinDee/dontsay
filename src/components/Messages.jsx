import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useSWR from "swr";
import html2canvas from "html2canvas";
import QRCode from "react-qr-code"; // Changed import
import "../Messages.css";

const fetcher = (url) =>
  axios
    .post(url, { token: localStorage.getItem("wispaToken") })
    .then((res) => res.data);

function Messages() {
  const [username, setUsername] = useState("...");
  const [showProfile, setShowProfile] = useState(false); // New state for profile visibility
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const qrCodeRef = useRef(null);

  const token = localStorage.getItem("wispaToken");

  const { data, error } = useSWR(
    token ? "https://wispain.vercel.app/get" : null,
    fetcher,
    {
      refreshInterval: 3000, 
    }
  );

  useEffect(() => {
    if (data) {
      setUsername(data.username.toLowerCase());
    } else if (!token) {
      navigate("/");
    }
  }, [data, token, navigate]);

  const logOut = () => {
    localStorage.removeItem("wispaToken");
    navigate("/");
  };

  // Memoize handlers
  const copy = useCallback(() => {
    const text = `🤫 Psst... Want to tell me something without getting caught? Here's your chance to spill the tea anonymously! 🫖\nhttps://wispah.vercel.app/send/${username}`;
    navigator.clipboard
      .writeText(text)
      .then(() => alert("Copied faster than you can say 'gossip'! 📢"))
      .catch(() => alert("Even ctrl+c failed us... Must be Monday! 😅"));
  }, [username]);

  const downloadCard = useCallback(
    (index) => {
      const card = cardRef.current.children[index + 1];
      const button = card.querySelector(".download-button");
      const generatedText = document.createElement("p");

      generatedText.className = "generated-text";
      generatedText.innerText = `Generated from Wispa,\nOne of ${username.toUpperCase()}'s Wispas.`;
      card.querySelector(".message-content").appendChild(generatedText);

      button.style.display = "none";

      setTimeout(() => {
        html2canvas(card, { useCORS: true }).then((canvas) => {
          const link = document.createElement("a");
          link.download = `message_${index}.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();

          button.style.display = "block";
          card.querySelector(".message-content").removeChild(generatedText);
        });
      }, 500);
    },
    [username]
  );

const downloadQR = useCallback(() => {
  const qrContainer = document.createElement("div");
  Object.assign(qrContainer.style, {
    background: "linear-gradient(135deg,rgb(0, 0, 0) 0%,rgb(4, 14, 33) 100%)",
    padding: "40px",
    // borderRadius: "20px",
    width: "fit-content",
    boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    color: "white",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: "1000",
    // border: "3px solid rgba(255,255,255,0.2)",
  });

  const title = document.createElement("h3");
  Object.assign(title.style, {
    marginBottom: "50px",
    color: "white",
    fontSize: "1.8rem",
    fontWeight: "700",
    textShadow: "1px 1px 2px rgba(0,0,0,0.2)",
  });
  title.innerText = `Send an anonymous message to ${username.toUpperCase()}`;
  qrContainer.appendChild(title);

  const qrClone = qrCodeRef.current.cloneNode(true);
  qrClone.style.transform = "scale(1.3)";
  // qrClone.style.border = "10px solid white";
  // qrClone.style.borderRadius = "15px";
  qrClone.style.boxShadow = "0 10px 20px rgba(0,0,0,0.1)";
  qrContainer.appendChild(qrClone);

  const caption = document.createElement("p");
  Object.assign(caption.style, {
    marginTop: "35px",
    color: "rgba(255,255,255,0.8)",
    fontSize: "1.1rem",
    fontStyle: "italic",
  });
  caption.innerText = "Scan to send a secret message!";
  qrContainer.appendChild(caption);

  document.body.appendChild(qrContainer);

  html2canvas(qrContainer, {
    backgroundColor: "white",
    scale: 3,
    useCORS: true,
  }).then((canvas) => {
    const link = document.createElement("a");
    link.download = `${username}_qr.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    document.body.removeChild(qrContainer);
  });
}, [username]);

  // Add loading states with humor
  if (error) return (
    <div className="alert alert-danger">
      <h3>🕊️ Oops! Our carrier pigeon got lost!</h3>
      <p>{error.message}</p>
    </div>
  );

  if (!data) return (
    <>
      <button className="btn w-100 btn-sm btn-outline-light mt-2 text-center download-button" onClick={() => setShowProfile(!showProfile)}>
        {showProfile ? "Hide Profile" : "Show Profile"}
      </button>
      {showProfile && (
        <div className="profile-section">
          {username !== "..." && (
            <>
              <h1 className="profile-username">
                Chief {username.toUpperCase()}! 🕵️‍♂️
              </h1>
              <div className="share-link">
                <p>Share your secret link:</p>
                <a href={`/send/${username}`}>
                  https://wispah.vercel.app/send/{username}
                </a>
              </div>
              <div className="qr-container">
                <div ref={qrCodeRef}>
                  <QRCode
                    value={`https://wispah.vercel.app/send/${username}`}
                    size={200}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="H"
                  />
                </div>
              </div>
                <button
                  className="download-qr-button"
                  onClick={downloadQR}
                >
                  Download QR Code 📱
                </button>
              <div className="share-buttons">
                <button
                  className="copy-button"
                  onClick={copy}
                >
                  Copy Link with Message 📋
                </button>
                <button
                  className="copy-button"
                  onClick={() => {
                    navigator.clipboard.writeText(`https://wispah.vercel.app/send/${username}`);
                    alert("Link copied! 📋");
                  }}
                >
                  Copy Just Link 🔗
                </button>
              </div>
            </>
          )}
        </div>
      )}
      <div className="loading-container">
        <div className="spinner-border text-light" role="status"></div>
        <p>🕵️‍♂️ Hunting down your secrets...</p>
        <p>Making sure no one's watching... 👀</p>
      </div>
    </>
  );

  // Ensure we have an array of messages
  const messages = Array.isArray(data?.message) ? data.message : [];

  // Add empty state with humor
  if (messages.length === 0) {
    return (
      <>
        <button className="btn w-100 btn-sm btn-outline-light mt-2 text-center download-button" onClick={() => setShowProfile(!showProfile)}>
          {showProfile ? "Hide Profile" : "Show Profile"}
        </button>
        {showProfile && (
          <div className="profile-section">
            {username !== "..." && (
              <>
                <h1 className="profile-username">
                  Chief {username.toUpperCase()}! 🕵️‍♂️
                </h1>
                <div className="share-link">
                  <p>Share your secret link:</p>
                  <a href={`/send/${username}`}>
                    https://wispah.vercel.app/send/{username}
                  </a>
                </div>
                <div className="qr-container">
                  <div ref={qrCodeRef}>
                    <QRCode
                      value={`https://wispah.vercel.app/send/${username}`}
                      size={200}
                      bgColor="#ffffff"
                      fgColor="#000000"
                      level="H"
                    />
                  </div>
                </div>
                  <button
                    className="download-qr-button"
                    onClick={downloadQR}
                  >
                    Download QR Code 📱
                  </button>
                <div className="share-buttons">
                  <button
                    className="copy-button"
                    onClick={copy}
                  >
                    Copy Link with Message 📋
                  </button>
                  <button
                    className="copy-button"
                    onClick={() => {
                      navigator.clipboard.writeText(`https://wispah.vercel.app/send/${username}`);
                      alert("Link copied! 📋");
                    }}
                  >
                    Copy Just Link 🔗
                  </button>
                </div>
              </>
            )}
          </div>
        )}
        <div className="alert alert-info">
          <h3>🦗 *crickets chirping*</h3>
          <p>Your inbox is as empty as a teenager's promises to clean their room!</p>
          <p>Share your link to start collecting secrets! 🤫</p>
        </div>
      </>
    );
  }

  return (
    <>
      <button className="btn w-100 btn-sm btn-outline-light mt-2 text-center download-button" onClick={() => setShowProfile(!showProfile)}>
        {showProfile ? "Hide Profile" : "Show Profile"}
      </button>
      {showProfile && (
        <div className="profile-section">
          {username !== "..." && (
            <>
              <h1 className="profile-username">
                Chief {username.toUpperCase()}! 🕵️‍♂️
              </h1>
              <div className="share-link">
                <p>Share your secret link:</p>
                <a href={`/send/{username}`}>
                  https://wispah.vercel.app/send/{username}
                </a>
              </div>
              <div className="qr-container">
                <div ref={qrCodeRef}>
                  <QRCode
                    value={`https://wispah.vercel.app/send/${username}`}
                    size={200}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="H"
                  />
                </div>
              </div>
                <button
                  className="download-qr-button"
                  onClick={downloadQR}
                >
                  Download QR Code 📱
                </button>
              <div className="share-buttons">
                <button
                  className="copy-button"
                  onClick={copy}
                >
                  Copy Link with Message 📋
                </button>
                <button
                  className="copy-button"
                  onClick={() => {
                    navigator.clipboard.writeText(`https://wispah.vercel.app/send/${username}`);
                    alert("Link copied! 📋");
                  }}
                >
                  Copy Just Link 🔗
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <div className="messages-container" ref={cardRef}>
        <p className="instructions">TAP ON ANY IMAGE TO ACCESS FULL SIZE</p>

        {messages
          .slice()
          .reverse()
          .map((message, index) => (
            <div className="message-box" key={index}>
              {message.imageURL && (
                <div className="message-image-container">
                  <img
                    src={message.imageURL}
                    alt="Attached"
                    className="message-image"
                    onClick={() => (window.location.href = message.imageURL)}
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
                <p className="message-date">
                  {new Date(message.time).toUTCString()}
                </p>
                <button
                  className="btn w-100 btn-sm btn-outline-light mt-2 text-center download-button"
                  onClick={() => downloadCard(index)}
                >
                  Download Card
                </button>
              </div>
            </div>
          ))}
      </div>

      <div className="mx-auto text-center">
        <button className="btn mt-4 mb-5 w-75 logout-button" onClick={logOut}>
          LOGOUT
        </button>
      </div>
    </>
  );
}

export default Messages;
