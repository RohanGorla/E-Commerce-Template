import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import axios from "axios";
import "../styles/MerchantRegister.css";

function MerchantOtp() {
  const context = useOutletContext();
  const navigate = useNavigate();
  const [OTP, setOTP] = useState("");
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  /* Check OTP API */

  async function checkotp() {
    const checkOtpResponse = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/checkotp`,
      {
        enteredOTP: OTP,
        sentOTP: context.otp,
      }
    );
    /* Add User API */
    if (checkOtpResponse.data.access) {
      let response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/addmerchant`,
        {
          company: context.companyName,
          mail: context.mail,
          password: context.password,
        }
      );
      if (response.data.access) {
        localStorage.setItem(
          "merchantInfo",
          JSON.stringify({
            company: context.companyName,
            mailId: context.mail,
            token: response.data.token,
          })
        );
        navigate("/merchant");
      } else {
        setError(true);
        setErrorMsg(response.data.errorMsg);
      }
    } else {
      setError(true);
      setErrorMsg("Wrong OTP!");
    }
  }
  
  return (
    <div className="Merchant_Register_Main">
      <div
        className={
          error
            ? "Merchant_Register_ErrorMsgBox--visible"
            : "Merchant_Register_ErrorMsgBox--invisible"
        }
      >
        <p className="Merchant_Register_ErrorMsgHeading">Error!</p>
        <p className="Merchant_Register_ErrorMsg">{errorMsg}</p>
      </div>
      <div className="Merchant_Register_Notes">
        <h2>Enter OTP.</h2>
        <p>Enter the otp that was sent to {context.mail}.</p>
      </div>
      <div className="Merchant_Register_Box">
        <div className="Merchant_Register_Input">
          <div>
            <label>OTP</label>
          </div>
          <input
            className="Merchant_Registerotp_Input"
            type="text"
            value={OTP}
            onChange={(e) => {
              setOTP(e.target.value);
            }}
          />
        </div>
        <div>
          <button
            className="Merchant_Register_Savechanges_Btn"
            onClick={checkotp}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default MerchantOtp;
