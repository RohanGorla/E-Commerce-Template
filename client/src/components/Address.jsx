import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Address.css";
import axios from "axios";

function Address() {
  const [orderedAddress, setOrderedAddress] = useState([]);
  const [address, setAddress] = useState([]);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const mailId = userInfo?.mailId;
  const navigate = useNavigate();

  /* Get Address API */

  async function getAddress() {
    let response = await axios.post(`${import.meta.env.VITE_BASE_URL}/getaddress`, {
      mail: mailId,
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
    } else {
      setSuccess(false);
      setError(true);
      setErrorMessage(response.data.errorMsg);
      setTimeout(() => {
        setError(false);
      }, 3500);
    }
  }

  /* Update Base Address API */

  async function changeBaseAddress(current) {
    let response = await axios.put(`${import.meta.env.VITE_BASE_URL}/updatebaseaddress`, {
      address: current,
      mailId: mailId,
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
      setError(false);
      setSuccess(true);
      setSuccessMessage(response.data.successMsg);
      setTimeout(() => {
        setSuccess(false);
      }, 3500);
    } else {
      setSuccess(false);
      setError(true);
      setErrorMessage(response.data.errorMsg);
      setTimeout(() => {
        setError(false);
      }, 3500);
    }
  }

  /* Remove Address API */

  async function removeAddress(address) {
    let response = await axios.delete(`${import.meta.env.VITE_BASE_URL}/deleteaddress`, {
      data: {
        mail: mailId,
        addressname: address.addressname,
        addressId: address.id,
      },
    });
    if (response.data.access) {
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
      setError(false);
      setSuccess(true);
      setSuccessMessage(response.data.successMsg);
      setTimeout(() => {
        setSuccess(false);
      }, 3500);
    } else {
      setSuccess(false);
      setError(true);
      setErrorMessage(response.data.errorMsg);
      setTimeout(() => {
        setError(false);
      }, 3500);
    }
  }

  useEffect(() => {
    getAddress();
  }, []);

  return (
    <div className="Address_Page">
      {/* Success Message Box */}
      <div
        className={
          success
            ? "Success_Message_Box Success_Message_Box--Active"
            : "Success_Message_Box Success_Message_Box--Inactive"
        }
      >
        <div className="Success_Message_Box--Container">
          <p className="Success_Message_Box--Heading">Success!</p>
          <p className="Success_Message_Box--Message">{successMessage}</p>
        </div>
      </div>
      {/* Error Message Box */}
      <div
        className={
          error
            ? "Error_Message_Box Error_Message_Box--Active"
            : "Error_Message_Box Error_Message_Box--Inactive"
        }
      >
        <div className="Error_Message_Box--Container">
          <p className="Error_Message_Box--Heading">Error!</p>
          <p className="Error_Message_Box--Message">{errorMessage}</p>
        </div>
      </div>
      {/* Address Main */}
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
