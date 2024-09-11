import React, { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import axios from "axios";

function Emailotp() {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const navigate = useNavigate();
  const context = useOutletContext();
  const [OTP, setOTP] = useState("");

  async function checkotp() {
    if (context.otp === Number(OTP)) {
      let response = await axios.put("http://localhost:3000/editusermail", {
        newmail: context.newMail,
        oldmail: userInfo.mailId,
        token: userInfo.token,
      });
      if (response.data.access) {
        localStorage.setItem(
          "userInfo",
          JSON.stringify({ ...userInfo, mailId: context.newMail })
        );
        let address = JSON.parse(localStorage.getItem("address"));
        localStorage.setItem(
          "address",
          JSON.stringify({ ...address, usermail: context.newMail })
        );
        navigate("/account/credentials");
      }
    }
  }

  return (
    <div className="Edit_Main">
      <div className="Edit_Notes">
        <h2>Enter OTP.</h2>
        <p>Enter the otp that was sent to {context.newMail}.</p>
      </div>
      <div className="Edit_Box">
        <div className="Edit_Input">
          <div>
            <label>OTP</label>
          </div>
          <input
            className="Editemailotp_Input"
            type="text"
            value={OTP}
            onChange={(e) => {
              setOTP(e.target.value);
            }}
          ></input>
        </div>
        <div>
          <button className="Savechanges_Btn" onClick={checkotp}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default Emailotp;
