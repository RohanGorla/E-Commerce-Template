import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Account.css";

function Account() {
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const mailId = userInfo?.mailId;
  const token = userInfo?.token;

  /* Authenticate User API */

  async function authenticate() {
    if (mailId && token) {
      let response = await axios.post(
        "http://localhost:3000/authenticateuser",
        {
          mail: mailId,
          token: token,
        }
      );
      if (response.data.access) {
        setData(response.data.data[0]);
      } else {
        setError(true);
        setErrorMessage(response.data.errorMsg);
        setTimeout(() => {
          localStorage.removeItem("userInfo");
          localStorage.removeItem("address");
          navigate("/account/login");
          setError(false);
        }, 4500);
      }
    } else {
      navigate("/account/login");
    }
  }

  useEffect(() => {
    authenticate();
  }, []);

  return (
    <div className="Account_Page">
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
      {/* Account Main */}
      <div className="Account_Container">
        <div className="Account_Main">
          <h2 className="Account_Heading">Your Account</h2>
          <div className="Account_Useroptions">
            <div className="Account_Userinfo">
              <p className="Account_Username">
                {data.firstname} {data.lastname}
              </p>
              <p className="Account_Usermail">{data.mailid}</p>
            </div>
            <div className="Account_Signout">
              <button
                className="Account_Signout_Btn"
                onClick={() => {
                  localStorage.removeItem("userInfo");
                  localStorage.removeItem("address");
                  setData([]);
                  navigate("/account/login");
                }}
              >
                Sign out
              </button>
            </div>
          </div>
          <div className="Account_Cards">
            <div
              className="Account_Card"
              onClick={() => {
                navigate("orders");
              }}
            >
              <div className="Account_Cardinfo">
                <p className="Account_Cardname">Your Orders</p>
                <p className="Account_Carddetail">
                  View all your order details.
                </p>
              </div>
            </div>
            <div
              className="Account_Card"
              onClick={() => {
                navigate("address");
              }}
            >
              <div className="Account_Cardinfo">
                <p className="Account_Cardname">Your Address</p>
                <p className="Account_Carddetail">
                  Select your address to which your orders will be delivered.
                </p>
              </div>
            </div>
            <div
              className="Account_Card"
              onClick={() => {
                navigate("credentials");
              }}
            >
              <div className="Account_Cardinfo">
                <p className="Account_Cardname">Login & security</p>
                <p className="Account_Carddetail">
                  View and edit your user credentials.
                </p>
              </div>
            </div>
            <div
              className="Account_Card"
              onClick={() => {
                navigate("wishlist");
              }}
            >
              <div className="Account_Cardinfo">
                <p className="Account_Cardname">Your Wishlists</p>
                <p className="Account_Carddetail">View all your wishlists.</p>
              </div>
            </div>
            <div
              className="Account_Card"
              onClick={() => {
                window.open(`${location.origin}/merchant`);
              }}
            >
              <div className="Account_Cardinfo">
                <p className="Account_Cardname">Merchant account</p>
                <p className="Account_Carddetail">
                  Sell your own products to customers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Account;
