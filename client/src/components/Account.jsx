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
        setdata(response.data.data);
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
        {data.map((data) => {
          return (
            <div key={data.id}>
              <h2>{data.firstname}</h2>
            </div>
          );
        })}
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
        {/* <button
          onClick={() => {
            navigate("login");
          }}
        >
          Login
        </button> */}
      </div>
      {/* <Outlet /> */}
    </>
  );
}

export default Account;
