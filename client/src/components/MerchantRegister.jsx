import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import axios from "axios";
import "../styles/MerchantRegister.css";

function MerchantRegister() {
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const context = useOutletContext();
  const navigate = useNavigate();

  /* Get Register OTP API */

  async function addMerchant(e) {
    e.preventDefault();
    let otpResponse = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/getregistermerchantotp`,
      {
        mail: context.mail,
      }
    );
    if (otpResponse.data.access) {
      context.setOtp(otpResponse.data.otp);
      navigate("merchantotp");
    } else {
      setError(true);
      setErrorMsg(otpResponse.data.errorMsg);
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
        <h2>Create Merchant Account!</h2>
      </div>
      <form className="Merchant_Register_Form" onSubmit={addMerchant}>
        <div className="Merchant_Register_Companyname">
          <label>Company Name</label>
          <input
            className="Merchant_Register_Companyname--Input"
            type="text"
            required
            onChange={(e) => {
              context.setCompanyName(e.target.value);
            }}
            value={context.companyName}
          ></input>
        </div>
        <div className="Merchant_Register_Email">
          <label>Email</label>
          <input
            className="Merchant_Register_Email--Input"
            type="email"
            required
            onChange={(e) => {
              context.setMail(e.target.value);
            }}
            value={context.mail}
          ></input>
        </div>
        <div className="Merchant_Register_Password">
          <label>Password</label>
          <input
            className="Merchant_Register_Password--Input"
            type="password"
            required
            onChange={(e) => {
              context.setPassword(e.target.value);
            }}
            value={context.password}
          ></input>
        </div>
        <div className="Merchant_Register_Signup">
          <input type="submit" value="Sign up"></input>
        </div>
      </form>
      <div className="Merchant_Register_Login">
        <p>Already have a merchant account?</p>
        <button
          onClick={() => {
            navigate("/merchant/login");
          }}
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default MerchantRegister;
