import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/MerchantLogin.css";

function MerchantLogin() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  async function checkMerchant() {
    let response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/authenticatemerchant`,
      {
        mail: email,
        password: pass,
      }
    );
    if (response.data.access) {
      localStorage.setItem(
        "merchantInfo",
        JSON.stringify({
          company: response.data.company,
          mailId: email,
          token: response.data.token,
        })
      );
      navigate("/merchant");
    } else {
      setError(true);
      setErrorMsg(response.data.errorMsg);
    }
  }

  return (
    <div className="Merchant_Login_Container">
      <div className="Merchant_Login_Main">
        {/* Error Message Box */}
        <div
          className={
            error
              ? "Merchant_Login_ErrorMsgBox--visible"
              : "Merchant_Login_ErrorMsgBox--invisible"
          }
        >
          <p className="Merchant_Login_ErrorMsgHeading">Error!</p>
          <p className="Merchant_Login_ErrorMsg">{errorMsg}</p>
        </div>
        {/* Login Main */}
        <div className="Merchant_Login_Notes">
          <p>
            Log into your account and enjoy shopping for your favourite product!
          </p>
        </div>
        <form className="Merchant_Login_Form">
          <div className="Merchant_Login_Email">
            <label>Email</label>
            <input
              className="Merchant_Login_Email--Input"
              type="mail"
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              value={email}
            />
          </div>
          <div className="Merchant_Login_Password">
            <label>Password</label>
            <input
              className="Merchant_Login_Password--Input"
              type="password"
              onChange={(e) => {
                setPass(e.target.value);
              }}
              value={pass}
            />
          </div>
        </form>
        <div className="Merchant_Login_Buttons">
          <div className="Merchant_Login_Buttons--Login">
            <button
              onClick={
                email && pass
                  ? checkMerchant
                  : () => {
                      setError(true);
                      setErrorMsg("Email or Password cannot be empty!");
                    }
              }
            >
              Log in
            </button>
          </div>
          <div className="Merchant_Login_Buttons--Register">
            <p>Don't have a merchant account?</p>
            <button
              onClick={() => {
                navigate("/account/register");
              }}
            >
              Create new account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MerchantLogin;
