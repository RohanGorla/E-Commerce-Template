import React, { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import axios from "axios";

function Emailotp() {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const navigate = useNavigate();
  const context = useOutletContext();
  const [OTP, setOTP] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  /* Check Otp API */

  async function checkotp() {
    const checkOtpResponse = await axios.post(
      "http://localhost:3000/checkotp",
      {
        enteredOTP: OTP,
        sentOTP: context.otp,
      }
    );
    /* Edit User Email API */
    if (checkOtpResponse.data.access) {
      const response = await axios.put("http://localhost:3000/editusermail", {
        newmail: context.newMail,
        oldmail: userInfo.mailId,
        token: userInfo.token,
      });
      if (response.data.access) {
        localStorage.setItem(
          "userInfo",
          JSON.stringify({
            ...userInfo,
            mailId: context.newMail,
            token: response.data.token,
          })
        );
        let address = JSON.parse(localStorage.getItem("address"));
        if (address) {
          localStorage.setItem(
            "address",
            JSON.stringify({ ...address, usermail: context.newMail })
          );
        }
        setError(false);
        setSuccess(true);
        setSuccessMessage(response.data.successMsg);
        setTimeout(() => {
          setSuccess(false);
          navigate("/account/credentials");
        }, 1500);
      } else {
        setSuccess(false);
        setError(true);
        setErrorMessage(response.data.errorMsg);
        setTimeout(() => {
          setError(false);
        }, 2500);
      }
    } else {
      setSuccess(false);
      setError(true);
      setErrorMessage("Wrong OTP! Please try again.");
      setTimeout(() => {
        setError(false);
      }, 2500);
    }
  }

  return (
    <div className="Edit_Page">
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
      {/* Edit Mail OTP */}
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
    </div>
  );
}

export default Emailotp;
