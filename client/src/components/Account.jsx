import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import axios from "axios";

function Account() {
  const [data, setdata] = useState([]);
  const navigate = useNavigate();
  function authenticateUser() {
    const userMail = localStorage.getItem("mailId");
    const token = localStorage.getItem("token");
    console.log(userMail, token);
    if (userMail && token) {
      authenticate();
    } else {
      console.log("in");
      navigate("/account/login");
    }
    async function authenticate() {
      let response = await axios.post(
        "http://localhost:3000/authenticateuser",
        {
          mail: userMail,
          token: token,
        }
      );
      if (response.data.code) {
        setdata(response.data.data[0]);
      } else {
        navigate("/account/login");
      }
    }
  }
  useEffect(() => {
    authenticateUser();
  }, []);
  return (
    <>
      <div>
        <div>
          <h2>
            {data.firstname} {data.lastname}
          </h2>
          <p>{data.mailid}</p>
        </div>
        <div>
          <button
            style={{
              borderStyle: "none",
              borderRadius: "15px",
              padding: "10px 15px",
              margin: "10px 0",
              cursor: "pointer",
            }}
            onClick={() => {
              navigate("orders");
            }}
          >
            Your Orders
          </button>
        </div>
      </div>
      <button
        onClick={() => {
          localStorage.removeItem("mailId");
          localStorage.removeItem("token");
          setdata([]);
          authenticateUser();
        }}
      >
        Sign out
      </button>
    </>
  );
}

export default Account;
