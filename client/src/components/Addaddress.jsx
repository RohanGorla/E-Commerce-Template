import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Addaddress.css";

function Addaddress() {
  const [fullName, setFullName] = useState("");
  const [house, setHouse] = useState("");
  const [street, setStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  // const [disable, setDisable] = useState(true);
  const navigate = useNavigate();

  async function addAddress() {
    const mail = localStorage.getItem("mailId");
    let response = await axios.post("http://localhost:3000/addaddress", {
      mail: mail,
      name: fullName,
      house: house,
      street: street,
      landmark: landmark,
      city: city,
      state: state,
      country: country,
    });
    console.log(response);
    navigate("/account/address");
  }

  return (
    <div className="Addaddress_Main">
      <div className="Addaddress_Heading">
        <h2>Add address</h2>
      </div>
      <div className="Addaddress_Component Addaddress_Name">
        <label>Name on the address</label>
        <input
          type="text"
          placeholder="Full name"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
          }}
          // id={disable ? "disable" : "active"}
          // disabled={disable}
        ></input>
      </div>
      <div className="Addaddress_Component Addaddress_House">
        <label>House/Flat/Door.No</label>
        <input
          type="text"
          placeholder="House/Flat/Door"
          value={house}
          onChange={(e) => {
            setHouse(e.target.value);
            // setDisable(false);
          }}
        ></input>
      </div>
      <div className="Addaddress_Component Addaddress_Street">
        <label>Street</label>
        <input
          type="text"
          placeholder="Street/Colony"
          value={street}
          onChange={(e) => {
            setStreet(e.target.value);
          }}
        ></input>
      </div>
      <div className="Addaddress_Component Addaddress_Landmark">
        <label>Landmark</label>
        <input
          type="text"
          placeholder="Landmark/Nearby place"
          value={landmark}
          onChange={(e) => {
            setLandmark(e.target.value);
          }}
        ></input>
      </div>
      <div className="Addaddress_Component Addaddress_Country">
        <label>Country</label>
        <input
          type="text"
          placeholder="Country"
          value={country}
          onChange={(e) => {
            setCountry(e.target.value);
          }}
        ></input>
      </div>
      <div className="Addaddress_Component Addaddress_State">
        <label>State</label>
        <input
          type="text"
          placeholder="State"
          value={state}
          onChange={(e) => {
            setState(e.target.value);
          }}
        ></input>
      </div>
      <div className="Addaddress_Component Addaddress_City">
        <label>City</label>
        <input
          type="text"
          placeholder="City"
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
          }}
        ></input>
      </div>
      <div className="Addaddress_Component Addaddress_Button">
        <button onClick={addAddress}>Add address</button>
      </div>
    </div>
  );
}

export default Addaddress;
