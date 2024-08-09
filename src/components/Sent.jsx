import { useNavigate } from 'react-router-dom';
import img from '../assets/sent.svg';
import '../Sent.css'; // Importing the custom CSS file

function Sent() {
    const navigate = useNavigate();
  
    return (
        <div className="sent-container">
            <div className="sent-content">
                <img src={img} className="sent-image" alt="Sample image" />
                <div className="sent-text">
                    <h2>YOU JUST WISPA*D TO SOMEONE!</h2>
                    <p>...get your wispa link too and share it, it is totally free!</p>
                    <button 
                        className="sent-btn" 
                        onClick={() => navigate('/')}
                    >
                        Get Link
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Sent;
