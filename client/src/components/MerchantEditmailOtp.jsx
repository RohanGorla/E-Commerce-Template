import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";

function MerchantEditmailOtp() {
  const context = useOutletContext();
  const [OTP, setOTP] = useState("");

  async function checkotp() {
    const checkOtpResponse = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/checkotp`,
      {
        enteredOTP: OTP,
        sentOTP: context.otp,
      }
    );
  }

  return (
    <div className="MerchantEmailEditOtp_Page">
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
