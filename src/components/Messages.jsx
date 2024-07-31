import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Item from './Item'
import axios from 'axios';

const items = [
{text: 'No whispers yet', date: '000-000' },
];
function Messages() {
  const [username, setusername] = useState("...")
  const [messages, setmessages] = useState(items)
  const navigate = useNavigate()
  const token = localStorage.getItem("wispaToken")
  useEffect(() => {
    if (localStorage.wispaToken) {
      axios.post('https://dontsay-backend.onrender.com/get', ({token: token}))
      .then((result)=>{
        if (result.data) {
          setusername(result.data.username)
          console.log(result.data)
          
          if (result.data.message!=="nothing") {
            setmessages(result.data.message)     
          }
          else{
            setmessages(items)     
          }    
        }
        else{
          console.log("Error")
        }
      })
      .catch((err)=>{
        console.log(err)
      })
    }
    else{
      navigate('/')
    }
    }, [token,navigate])
    const logOut =()=>{
      localStorage.removeItem("wispaToken")
      navigate('/')
    }
    const copy =()=>{
      navigator.clipboard.writeText(`ready, set, vent! 💀\n
send me an anonymous message, get everything off your chest, you can add an image for context or proof, if you dare. let's get real!! 🤐 \nwispah.vercel.app/send/${username}`)
      alert("Copied!")
    }
  return (
    <>

<div>
    <div className="card mb-3 mt-5">
    
      <div className="card-body">
        <p className="card-text">Welcome, {username.toUpperCase()}.</p>
        <p className="card-text">
          <small className="">Here is your link: wispah.vercel.app/send/{username}</small>
        </p>
        <button className='btn btn-light' onClick={copy}>Copy with content</button>
         <p className="card-text text-center">Click images to enlarge to original size</p>

    </div>
    </div>
    </div>
    <div className='mt-5 pt-2'>
        
    <div className="container">
      <div className="row">
        {messages.map((item, index) => (
          <div key={index} className="col-md-4 mb-3">
            <Item
              img={item.imageURL}
              text={item.message}
              date={item.time}
            />
          </div>
        ))}
      </div>
      <button className="mb-0 px-5 form-control mb-5" onClick={logOut} style={{backgroundColor: "#05163d", color: "white"}}>LOGOUT</button>

    </div>

    </div>
    </>
  )
}

export default Messages
