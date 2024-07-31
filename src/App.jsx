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
