import { useState } from 'react'
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import sendImg from '../assets/secret.svg'
import {MDBContainer, MDBCol, MDBRow, MDBInput} from 'mdb-react-ui-kit';
import axios from 'axios';
function Send() {
  let { usernamee} = useParams();
    const [message, setmessage] = useState('')

    const [messagee, setmessagee] = useState("")
    const [img, setimg] = useState("")
    const navigate = useNavigate()
    const [loading, setloading] = useState(false)
    const handleImg =(e)=>{
      setloading(true)
        const file = e.target.files[0]

        const reader = new FileReader()

        reader.onload =()=>{
            setimg(reader.result)

            setloading(false)
        }
        reader.readAsDataURL(file)
    }
    const send = ()=>{
      if (message=="") {
        alert("Fill in everything, fam...")
      }
      else{
        setloading(true)
        console.log(usernamee)
          console.log({username: usernamee, message: message, img: img})
          axios.post(`https://dontsay-backend.onrender.com/send`, ({username: usernamee, message: message, img: img})).then((result)=>{
            setloading(false)

            console.log(result)
            if (result.data.stat==true) {
              navigate('/sent')
            }
            else{
              if (result.data.message=="user not found") {
                setmessagee("Check link and try again")
              }
              else{
                setmessagee(result.data.message)
              }
            }
          })
          .catch((err)=>{
            setloading(false)

            setmessagee(err.message)
          })
      }
    }
  return (
    <>
<MDBContainer fluid className="p-3 my-5 h-custom">

<MDBRow>

<MDBCol col='10' md='6'>
<img src={sendImg} className="img-fluid" alt="Sample image" />
</MDBCol>

<MDBCol col='4' md='6'>
<div className='fs-1 text-center fw-bold'>
  WISPA TO {usernamee.toUpperCase()}
</div>

<textarea className='form-control p-1 my-2' placeholder='...Your text here' onChange={(e)=>{setmessage(e.target.value)}}/>
<MDBInput wrapperClass='mb-4' label='Image' id='formControlLg' type='file' accept='image/' size="lg" onChange={(e)=>{handleImg(e)}}/>
{messagee}
  {loading?<span disabled className='form-control d-flex justify-content-center center' style={{backgroundColor: "#080a1d"}}><div className="spinner-border" role="status"></div></span>: <button className="mb-0 px-5 form-control" onClick={send} style={{backgroundColor: "#05163d", color: "white"}}>WISPA...</button>}

</MDBCol>

</MDBRow>

</MDBContainer>
    </>
  )
}

export default Send
