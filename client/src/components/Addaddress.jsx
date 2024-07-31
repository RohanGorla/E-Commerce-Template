import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Addaddress() {
  const [fullName, setFullName] = useState("");
  const [house, setHouse] = useState("");
  const [street, setStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
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
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <div style={{ margin: "20px 0" }}>
        <input
          style={{ padding: "8px 10px 2px 1px" }}
          type="text"
          placeholder="Full name"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
          }}
        ></input>
      </div>
      <div style={{ margin: "20px 0" }}>
        <input
          style={{ padding: "8px 10px 2px 1px" }}
          type="text"
          placeholder="House/Flat/Door"
          value={house}
          onChange={(e) => {
            setHouse(e.target.value);
          }}
        ></input>
      </div>
      <div style={{ margin: "20px 0" }}>
        <input
          style={{ padding: "8px 10px 2px 1px" }}
          type="text"
          placeholder="Street/Colony"
          value={street}
          onChange={(e) => {
            setStreet(e.target.value);
          }}
        ></input>
      </div>
      <div style={{ margin: "20px 0" }}>
        <input
          style={{ padding: "8px 10px 2px 1px" }}
          type="text"
          placeholder="Landmark/Nearby place"
          value={landmark}
          onChange={(e) => {
            setLandmark(e.target.value);
          }}
        ></input>
      </div>
      <div style={{ margin: "20px 0" }}>
        <input
          style={{ padding: "8px 10px 2px 1px" }}
          type="text"
          placeholder="Country"
          value={country}
          onChange={(e) => {
            setCountry(e.target.value);
          }}
        ></input>
      </div>
      <div style={{ margin: "20px 0" }}>
        <input
          style={{ padding: "8px 10px 2px 1px" }}
          type="text"
          placeholder="State"
          value={state}
          onChange={(e) => {
            setState(e.target.value);
          }}
        ></input>
      </div>
      <div style={{ margin: "20px 0" }}>
        <input
          style={{ padding: "8px 10px 2px 1px" }}
          type="text"
          placeholder="City"
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
          }}
        ></input>
      </div>
      <button
        style={{ padding: "10px 15px", borderRadius: "10px" }}
        onClick={addAddress}
      >
        Add address
      </button>
    </div>
  );
}

export default Addaddress;
