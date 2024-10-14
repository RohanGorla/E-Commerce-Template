import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Address.css";
import axios from "axios";

function Address() {
  const [orderedAddress, setOrderedAddress] = useState([]);
  const [address, setAddress] = useState([]);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const mailId = userInfo?.mailId;
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

  async function removeAddress(address) {
    let response = await axios.delete("http://localhost:3000/deleteaddress", {
      data: {
        mail: mailId,
        addressname: address.addressname,
        addressId: address.id,
      },
    });
    if (address.addressname === userInfo?.base_address) {
      setOrderedAddress(response.data.data);
      setAddress(response.data.data);
      localStorage.removeItem("address");
      localStorage.setItem(
        "userInfo",
        JSON.stringify({
          firstname: userInfo?.firstname,
          lastname: userInfo?.lastname,
          mailId: userInfo?.mailId,
          token: userInfo?.token,
        })
      );
    } else {
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
      } else {
        console.log(response.data.errorMsg);
      }
    }
  }

  useEffect(() => {
    getAddress();
  }, []);

  return (
    <div className="Address_Page">
      <div className="Address_Main">
        <div className="Address_Main--Header">
          <h1>Your Address</h1>
          <button
            onClick={() => {
              navigate("addaddress");
            }}
          >
            Add Address
          </button>
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
                      <span
                        className="Address_Main--Address_Options--Option"
                        onClick={() => {
                          removeAddress(address);
                        }}
                      >
                        Remove
                      </span>
                    </div>
                  ) : (
                    <div className="Address_Main--Address_Options">
                      <span
                        className="Address_Main--Address_Options--Option"
                        onClick={() => {
                          removeAddress(address);
                        }}
                      >
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
