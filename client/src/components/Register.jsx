import { useState, useEffect } from "react";
import axios from "axios";

function Register() {
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");

  async function addUser() {
    await axios
      .post(`${import.meta.env.VITE_BASE_URL}/addUser`, {
        first: first,
        last: last,
        mail: mail,
        password: password,
      })
      .then((response) => {
        console.log(response);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  async function checkUser() {
    await axios
      .post(`${import.meta.env.VITE_BASE_URL}/checkUser`, {
        mail: email,
        password: pass,
      })
      .then((response) => {
        console.log(response);
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
          <label style={{ marginRight: ".4em" }}>First name</label>
          <input
            type="text"
            onChange={(e) => {
              setFirst(e.target.value);
            }}
            value={first}
          ></input>
        </div>
        <div style={{ margin: "1em 0" }}>
          <label style={{ marginRight: ".4em" }}>Last name</label>
          <input
            type="text"
            onChange={(e) => {
              setLast(e.target.value);
            }}
            value={last}
          ></input>
        </div>
        <div style={{ margin: "1em 0" }}>
          <label style={{ marginRight: ".4em" }}>Email</label>
          <input
            type="mail"
            onChange={(e) => {
              setMail(e.target.value);
            }}
            value={mail}
          ></input>
        </div>
        <div style={{ margin: "1em 0" }}>
          <label style={{ marginRight: ".4em" }}>Password</label>
          <input
            type="password"
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            value={password}
          ></input>
        </div>

        <div style={{ margin: "1em 0" }}>
          <button style={{ padding: ".3em .4em" }} onClick={addUser}>
            Sign up
          </button>
        </div>
      </div>
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
          <button style={{ padding: ".3em .4em" }} onClick={checkUser}>
            Log in
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;
