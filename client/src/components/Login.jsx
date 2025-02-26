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

  /* Login API */

  async function checkUser() {
    let response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/checkUser`,
      {
        mail: email,
        password: pass,
      }
    );
    if (response.data.access) {
      localStorage.setItem(
        "userInfo",
        JSON.stringify({
          firstname: response.data.firstname,
          lastname: response.data.lastname,
          mailId: email,
          token: response.data.token,
          base_address: response.data.base_address,
        })
      );
      if (response.data.baseAdd.length) {
        localStorage.setItem(
          "address",
          JSON.stringify(response.data.baseAdd[0])
        );
      }
      navigate("/account");
    } else {
      setError(true);
      setErrorMsg(response.data.errorMsg);
    }
  }

  return (
    <div className="Login_Container">
      <div className="Login_Main">
        {/* Error Message Box */}
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
        {/* Login Main */}
        <div className="Login_Notes">
          <h2>Login to your account</h2>
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
        <div className="Login_Buttons">
          <div className="Login_Buttons--Login">
            <button
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
