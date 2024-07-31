import React from 'react'

function Item({img,text,date}) {
    const getImage =()=>{
    window.location.href = img;
  }
  return (
    <>
    {img? <div>
    <div className="card mb-3">
      <img src={img} onClick={getImage} className="card-img-top img-fluid" alt="Image" style={{maxHeight: "200px", maxWidth: '100%', objectFit: "cover"}}/>
      <div className="card-body">
        <p className="card-text">{text}</p>
        <p className="card-text">
          {date?<small className="">Date: {date} </small>:<small className="">...</small>}
        </p>
    </div>
    </div>
    </div>: <div>
    <div className="card mb-3">
      <span src={img} className="card-img-top img-fluid" alt="Image" style={{maxHeight: "200px", maxWidth: '100%'}}/>
      <div className="card-body">
        <p className="card-text">{text}</p>
        <p className="card-text">
          {date?<small className="">Date: {date} </small>:<small className="">...</small>}
        </p>
    </div>
    </div>
    </div>}
    </>
  )
}

export default Item
