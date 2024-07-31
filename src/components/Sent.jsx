import React, { useState } from 'react'
import signupImg from '../assets/signup.svg'
import axios from 'axios';
import {MDBContainer, MDBCol, MDBRow, MDBBtn, MDBIcon, MDBInput, MDBCheckbox } from 'mdb-react-ui-kit';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import img from '../assets/sent.svg'
function Sent() {
    const navigate = useNavigate()
  return (
    <>
      <MDBContainer fluid className="p-3 my-5 h-custom">

<MDBRow>

<MDBCol col='10' md='6'>
<img src={img} className="img-fluid" alt="Sample image" />
</MDBCol>

<MDBCol col='4' md='6'>
<div className='fs-3 text-center fw-bold mt-5'>
  YOU JUST WISPA'D TO SOMEONE!
  <br />
</div>
  <small>...get your wispa link too and share it, it is totally free! </small>



  <button className="mb-0 px-5 mt-5 form-control" onClick={()=>{navigate('/')}} style={{backgroundColor: "#05163d", color: "white"}}>Get Link</button>

</MDBCol>

</MDBRow>

</MDBContainer>
    </>
  )
}

export default Sent
