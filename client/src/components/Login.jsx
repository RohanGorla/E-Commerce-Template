import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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
          console.log(response.data);
          localStorage.setItem(
            "userInfo",
            JSON.stringify({
              firstname: response.data.firstname,
              lastname: response.data.lastname,
              mailId: email,
              token: response.data.token,
            })
          );
          localStorage.setItem("mailId", email);
          localStorage.setItem("token", response.data.token);
          navigate("/account");
        } else {
          setError(true);
          setErrorMsg(response.data.errorMsg);
          console.log("false");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <div
      className="Login_Container"
      // style={{
      //   display: "flex",
      //   justifyContent: "center",
      //   gap: "3em",
      //   width: "60%",
      //   margin: "0 auto",
      // }}
    >
      <div className="Login_Main">
        <div
          className={
            error
              ? "Login_ErrorMsgBox--visible"
              : "Login_ErrorMsgBox--invisible"
          }
        >
          <p className="Login_ErrorMsgHeading">Error!</p>
          <p className="Login_ErrorMsg">{errorMsg}</p>
        </div>
        <div className="Login_Notes">
          <p>
            Log into your account and enjoy shopping for your favourite product!
          </p>
        </div>
        <form className="Login_Form">
          <div className="Login_Email">
            <label>Email</label>
            <input
              className="Login_Email--Input"
              type="mail"
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              value={email}
            ></input>
          </div>
          <div className="Login_Password">
            <label>Password</label>
            <input
              className="Login_Password--Input"
              type="password"
              onChange={(e) => {
                setPass(e.target.value);
              }}
              value={pass}
            ></input>
          </div>
        </form>
        <div className="Login_Buttons" style={{ margin: "1em 0" }}>
          <div className="Login_Buttons--Login">
            <button
              // style={{ padding: ".3em .4em" }}
              onClick={
                email && pass
                  ? checkUser
                  : () => {
                      setError(true);
                      setErrorMsg("Email or Password cannot be empty!");
                    }
              }
            >
              Log in
            </button>
          </div>
          <div className="Login_Buttons--Register">
            <p>Don't have an account?</p>
            <button
              onClick={() => {
                navigate("/account/register");
              }}
            >
              Create new acoount
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
