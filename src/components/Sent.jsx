import { useNavigate } from 'react-router-dom';
import img from '../assets/sent.svg';
import '../Sent.css'; // Importing the custom CSS file

function Sent() {
    const navigate = useNavigate();
  
    return (
        <div className="sent-container">
            <div className="sent-content">
                <img src={img} className="sent-image" alt="Mission Accomplished!" />
                <div className="sent-text">
                    <h2>BOOM! YOUR WISPA JUST NINJA'D ITS WAY TO THEM! 🥷</h2>
                    <p>Want your own secret mailbox? It's free (like your tea-spilling spirit! 🫖)</p>
                    <button 
                        className="sent-btn" 
                        onClick={() => navigate('/')}
                    >
                        Get Your Spy Kit 🕵️‍♂️
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Sent;
