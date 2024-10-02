import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Address() {
  const [address, setAddress] = useState([]);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const navigate = useNavigate();

  async function changeBaseAddress(current) {
    let response = await axios.put("http://localhost:3000/updatebaseaddress", {
      address: current,
      mailId: userInfo.mailId,
    });
    console.log(response);
    if (response.data.access) {
      let userInfo = JSON.parse(localStorage.getItem("userInfo"));
      localStorage.setItem(
        "userInfo",
        JSON.stringify({ ...userInfo, base_address: current.addressname })
      );
    }
  }

  useEffect(() => {
    async function getAddress() {
      // const mail = localStorage.getItem("mailId");
      const mail = userInfo.mailId;
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
              changeBaseAddress(currentAddress);
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
