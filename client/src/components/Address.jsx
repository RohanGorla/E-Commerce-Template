import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Address.css";
import axios from "axios";

function Address() {
  const [orderedAddress, setOrderedAddress] = useState([]);
  const [address, setAddress] = useState([]);
  console.log(address);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const navigate = useNavigate();

  async function getAddress() {
    const mail = userInfo?.mailId;
    let response = await axios.post("http://localhost:3000/getaddress", {
      mail: mail,
    });
    if (response.data.access) {
      setOrderedAddress(response.data.data);
      let baseAddress = [];
      let otherAddress = [];
      response.data.data.filter((address) => {
        if (address.addressname === userInfo?.base_address) {
          baseAddress.push(address);
        } else {
          otherAddress.push(address);
        }
      });
      setAddress([...baseAddress, ...otherAddress]);
    }
  }

  async function changeBaseAddress(current) {
    let response = await axios.put("http://localhost:3000/updatebaseaddress", {
      address: current,
      mailId: userInfo?.mailId,
    });
    if (response.data.access) {
      localStorage.setItem(
        "userInfo",
        JSON.stringify({ ...userInfo, base_address: current.addressname })
      );
      localStorage.setItem("address", JSON.stringify(current));
      let baseAddress = [];
      let otherAddress = [];
      orderedAddress.filter((address) => {
        if (address.addressname === current.addressname) {
          baseAddress.push(address);
        } else {
          otherAddress.push(address);
        }
      });
      setAddress([...baseAddress, ...otherAddress]);
    }
  }

  useEffect(() => {
    getAddress();
  }, []);

  return (
    <div className="Address_Page">
      {/* <div
        onClick={() => {
          navigate("addaddress");
        }}
      >
        <p>+ ADD ADDRESS</p>
      </div> */}
      <div className="Address_Main">
        <div className="Address_Main--Header">
          <h1>Address</h1>
        </div>
        <div className="Address_Main--Addresses">
          {address?.map((address, index) => {
            return (
              <div key={index} className="Address_Main--Address_Container">
                <div
                  className={
                    userInfo?.base_address === address.addressname
                      ? "Address_Main--Address Address_Main--Address--Default"
                      : "Address_Main--Address"
                  }
                >
                  <p className="Address_Main--Address_Name">
                    {address.addressname}
                    <span className="Address_Main--Address_Name--Default_Note">
                      {userInfo?.base_address === address.addressname
                        ? " (Default)"
                        : ""}
                    </span>
                  </p>
                  <p className="Address_Main--Address_Info">{address.house}</p>
                  <p className="Address_Main--Address_Info">{address.street}</p>
                  <p className="Address_Main--Address_Info">
                    {address.landmark}
                  </p>
                  <p className="Address_Main--Address_Info">
                    {address.city}, {address.state}
                  </p>
                  <p className="Address_Main--Address_Info">
                    {address.country}
                  </p>
                  {address.addressname === userInfo?.base_address ? (
                    <div className="Address_Main--Address_Options">
                      <span className="Address_Main--Address_Options--Option">
                        Remove
                      </span>
                    </div>
                  ) : (
                    <div className="Address_Main--Address_Options">
                      <span className="Address_Main--Address_Options--Option">
                        Remove
                      </span>{" "}
                      |{" "}
                      <span
                        className="Address_Main--Address_Options--Option"
                        onClick={() => {
                          changeBaseAddress(address);
                        }}
                      >
                        Set as default
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Address;
