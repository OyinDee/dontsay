import { useState } from 'react'
import reactLogo from './assets/react.svg'
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import axios from 'axios';
import Signup from './components/Signup';
import Send from './components/Send'
import Sent from './components/Sent';
import Messages from './components/Messages';
import './App.css'
function App() {
  return (
    <>
  <div className='my-0'>
    <figure className="text-end p-2 my-0" style={{backgroundColor: "#05163d", color: "white", fontFamily:"Lobster"}}>
    <blockquote className="blockquote" >
    <p className= "pe-5 pt-2" style={{backgroundColor: "#05163d", color: "white", fontFamily:"Lobster"}}>Wispa</p>
    </blockquote>
    </figure>
  </div>  
    <Routes>
      <Route path= '/create' element= {<Signup/>}/>
      <Route path = '/send/:usernamee' element ={<Send/>}/>
      <Route path = '/get' element ={<Messages/>}/>
      <Route path= '/' element= {<Login/>}/>
      <Route path= '/sent' element= {<Sent/>}/>

    </Routes>
    </>
  )
}

export default App
