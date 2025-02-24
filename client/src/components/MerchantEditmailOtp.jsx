import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";

function MerchantEditmailOtp() {
  const context = useOutletContext();
  const [OTP, setOTP] = useState("");

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
            <button className="MerchantEditDetail_Savechanges_Button">
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MerchantEditmailOtp;
