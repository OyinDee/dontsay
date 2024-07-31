import React, { useState } from 'react'
import signupImg from '../assets/signup.svg'
import axios from 'axios';
import {MDBContainer, MDBCol, MDBRow, MDBBtn, MDBIcon, MDBInput, MDBCheckbox } from 'mdb-react-ui-kit';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
function Signup() {
  const [message, setmessage] = useState("")
  const [username, setusername] = useState("")
  const [password, setpassword] = useState("")
  const [loading, setloading] = useState(false)
  const navigate = useNavigate()
  useEffect(() => {
  if (localStorage.wispaToken) {
    navigate("/get/")
  }
  }, [])
  const signUp =()=>{
    if (password=="" || username=="") {
      setmessage("You know what to do.")
    }
    else{
      setloading(true)
  
      axios.post('https://dontsay-backend.onrender.com/user/create', ({
        username:username,
        password:password
      }))
      .then((result)=>{
        console.log(result.data)
        if (result.data.stat==true) {
          localStorage.setItem("wispaToken", result.data.token)
          navigate("/get/");
        }
        else{
        setmessage(result.data.message)
        }
        setloading(false)
      })
      .catch((err)=>{
        setmessage(err.message)
        console.log(err.message)
        setloading(false)
      })
    }
  }
  return (
    <>
          <>


<MDBContainer fluid className="p-3 my-5 h-custom" style={{display: "flex",
    height: "100dvh"}}>

<MDBRow style={{width: "100%",margin: "auto"}}>

<MDBCol col='10' md='6'>
<img src={signupImg} className="img-fluid" alt="Sample image" />
</MDBCol>

<MDBCol col='4' md='6' style={{display: "flex",maxWidth: "40rem",flexDirection: "column",marginTop: "-2rem",justifyContent: "center"}}>
<div className='fs-1'>
  SIGN UP TO LISTEN TO YOUR FRIEND'S WHISPERS...
</div>

<MDBInput wrapperClass='mb-4' label='Username' id='formControlLg' type='text' size="lg" onChange={(e)=>{setusername((e.target.value).toLowerCase())}}/>
<MDBInput wrapperClass='mb-4' label='Password' id='formControlLg' type='password' size="lg" onChange={(e)=>{setpassword(e.target.value)}}/>



{message}
      {loading==false? <button className="mb-0 px-5 form-control" onClick={signUp} style={{backgroundColor: "#05163d", color: "white"}}>SIGNUP</button>: <span disabled className='form-control d-flex justify-content-center center' style={{backgroundColor: "#080a1d"}}><div className="spinner-border" role="status"></div></span>}

<div className='text-center text-md-start mt-4 pt-2'>
  <p className="small fw-bold mt-2 pt-1 mb-2">Already have an account? <a href='/'>Login</a></p>
</div>

</MDBCol>

</MDBRow>

</MDBContainer>
</>
    </>
  )
}

export default Signup
