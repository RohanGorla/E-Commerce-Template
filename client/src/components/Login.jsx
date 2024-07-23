import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  const navigate = useNavigate();

  async function checkUser() {
    await axios
      .post(`${import.meta.env.VITE_BASE_URL}/checkUser`, {
        mail: email,
        password: pass,
      })
      .then((response) => {
        console.log(response);
        if (response.data.access) {
          localStorage.setItem("mailId", email);
          localStorage.setItem("token", response.data.token);
          navigate("/account");
        } else {
          console.log("false");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "3em",
        width: "60%",
        margin: "0 auto",
      }}
    >
      <div>
        <div style={{ margin: "1em 0" }}>
          <label style={{ marginRight: ".4em" }}>Email</label>
          <input
            type="mail"
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            value={email}
          ></input>
        </div>
        <div style={{ margin: "1em 0" }}>
          <label style={{ marginRight: ".4em" }}>Password</label>
          <input
            type="password"
            onChange={(e) => {
              setPass(e.target.value);
            }}
            value={pass}
          ></input>
        </div>
        <div style={{ margin: "1em 0" }}>
          <button
            style={{ padding: ".3em .4em" }}
            onClick={email && pass ? checkUser : null}
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
