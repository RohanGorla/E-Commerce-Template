import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Address() {
  const [address, setAddress] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const mail = localStorage.getItem("mailId");
    console.log(mail);
    async function getAddress() {
        let response = await axios.post("")
    }
  }, []);
  return (
    <div>
      <div
        style={{
          backgroundColor: "lightgrey",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "black",
          width: "300px",
          height: "250px",
          fontFamily: "monospace",
          fontWeight: "600",
          fontSize: "30px",
          borderRadius: "20px",
          cursor: "pointer",
        }}
        onClick={() => {
          navigate("addaddress");
        }}
      >
        <p>+ ADD ADDRESS</p>
      </div>
      <div></div>
    </div>
  );
}

export default Address;
