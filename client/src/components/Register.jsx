import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");

  const navigate = useNavigate();

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
        if (response.data.access) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("mailId", mail);
          navigate("/account");
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
          <button
            style={{ padding: ".3em .4em" }}
            onClick={mail && password ? addUser : null}
          >
            Sign up
          </button>
        </div>
        <button
          onClick={() => {
            navigate("/account/login");
          }}
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default Register;
