import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";

function MerchantEditmailOtp() {
  const context = useOutletContext();
  const merchantInfo = JSON.parse(localStorage.getItem("merchantInfo"));
  const [OTP, setOTP] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  async function checkotp() {
    const checkOtpResponse = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/checkotp`,
      {
        enteredOTP: OTP,
        sentOTP: context.otp,
      }
    );
    if (checkOtpResponse.data.access) {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/editmerchantemail`,
        {
          newmail: context.newMail,
          oldmail: merchantInfo.mailId,
          token: merchantInfo.token,
        }
      );
    }
  }

  return (
    <div className="MerchantEmailEditOtp_Page">
      {/* Error Message Box */}
      <div
        className={
          error
            ? "Error_Message_Box Error_Message_Box--Active"
            : "Error_Message_Box Error_Message_Box--Inactive"
        }
      >
        <div className="Error_Message_Box--Container">
          <p className="Error_Message_Box--Heading">Error!</p>
          <p className="Error_Message_Box--Message">{errorMessage}</p>
        </div>
      </div>
      {/* Success Message Box */}
      <div
        className={
          success
            ? "Success_Message_Box Success_Message_Box--Active"
            : "Success_Message_Box Success_Message_Box--Inactive"
        }
      >
        <div className="Success_Message_Box--Container">
          <p className="Success_Message_Box--Heading">Success!</p>
          <p className="Success_Message_Box--Message">{successMessage}</p>
        </div>
      </div>
      {/* Enter Otp To Edit Merchant Email */}
      <div className="MerchantEditDetail_Main">
        <div className="MerchantEditDetail_Header">
          <h2>Enter OTP.</h2>
          <p>Enter the otp that was sent to {context.newMail}.</p>
        </div>
        <div className="MerchantEditDetail_Container">
          <div className="MerchantEditDetail_Input_Container">
            <div>
              <label>OTP:</label>
            </div>
            <input
              className="MerchantEditDetail_Input MerchantEditEmailOtp_Input"
              type="text"
              value={OTP}
              onChange={(e) => {
                setOTP(e.target.value);
              }}
            ></input>
          </div>
          <div>
            <button
              className="MerchantEditDetail_Savechanges_Button"
              onClick={checkotp}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MerchantEditmailOtp;
