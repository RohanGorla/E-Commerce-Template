import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Address() {
  const [address, setAddress] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function getAddress() {
      const mail = localStorage.getItem("mailId");
      let response = await axios.post("http://localhost:3000/getaddress", {
        mail: mail,
      });
      console.log(response);
      setAddress(response.data);
    }
    getAddress();
  }, []);
  return (
    <div style={{ display: "flex", flexWrap: "wrap" }}>
      <div
        style={{
          backgroundColor: "lightgrey",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "black",
          width: "350px",
          height: "250px",
          fontFamily: "monospace",
          fontWeight: "600",
          fontSize: "30px",
          borderRadius: "20px",
          margin: "20px 20px",
          cursor: "pointer",
        }}
        onClick={() => {
          navigate("addaddress");
        }}
      >
        <p>+ ADD ADDRESS</p>
      </div>
      {address?.map((address, index) => {
        return (
          <div
            key={index}
            style={{
              backgroundColor: "lightgrey",
              color: "black",
              width: "350px",
              height: "250px",
              fontFamily: "monospace",
              borderRadius: "20px",
              margin: "20px 20px",
              cursor: "pointer",
            }}
            onClick={() => {
              const currentAddress = address;
              console.log(currentAddress);
              localStorage.setItem("address", JSON.stringify(currentAddress));
            }}
          >
            <h2
              style={{
                fontSize: "30px",
                textAlign: "center",
                padding: "25px 0",
              }}
            >
              {address.addressname}
            </h2>
            <p
              style={{
                fontSize: "14px",
                fontWeight: "700",
                margin: "10px 0",
                marginLeft: "10px",
              }}
            >
              {address.house}
            </p>
            <p
              style={{
                fontSize: "14px",
                fontWeight: "700",
                margin: "10px 0",
                marginLeft: "10px",
              }}
            >
              {address.street}
            </p>
            <p
              style={{
                fontSize: "14px",
                fontWeight: "700",
                margin: "10px 0",
                marginLeft: "10px",
              }}
            >
              {address.landmark}
            </p>
            <p
              style={{
                fontSize: "14px",
                fontWeight: "700",
                margin: "10px 0",
                marginLeft: "10px",
              }}
            >
              {address.city}, {address.state}
            </p>
            <p
              style={{
                fontSize: "14px",
                fontWeight: "700",
                margin: "10px 0",
                marginLeft: "10px",
              }}
            >
              {address.country}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export default Address;
