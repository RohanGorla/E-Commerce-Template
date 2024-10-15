import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Outlet, useOutletContext } from "react-router-dom";
import "../styles/Edit.css";

function Editmail() {
  const navigate = useNavigate();
  const context = useOutletContext();
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  async function editmail(e) {
    e.preventDefault();
    if (context.userInfo.mailId === context.newMail) {
      setSuccess(false);
      setError(true);
      setErrorMessage("New and old emails cannot be the same!");
      setTimeout(() => {
        setError(false);
      }, 2500);
    } else {
      let otpResponse = await axios.post(
        "http://localhost:3000/getemailchangeotp",
        {
          mail: context.newMail,
        }
      );
      if (otpResponse.data.access) {
        context.setOtp(otpResponse.data.otp);
        navigate("/account/credentials/email/emailotp");
      } else {
        setSuccess(false);
        setError(true);
        setErrorMessage(otpResponse.data.errorMsg);
        setTimeout(() => {
          setError(false);
        }, 2500);
      }
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
      {/* Edit Email */}
      <div className="Edit_Main">
        <div className="Edit_Notes">
          <h2>Change your mail.</h2>
          <p>Edit your mail id and click save to save changes.</p>
        </div>
        <form className="Edit_Box" onSubmit={editmail}>
          <div className="Edit_Input">
            <label>New email</label>
            <input
              className="Editmail_Input"
              type="email"
              value={context.newMail}
              onChange={(e) => {
                context.setNewMail(e.target.value);
              }}
            ></input>
          </div>
          <div>
            <input
              className="Savechanges_Btn"
              type="submit"
              value="Save"
            ></input>
          </div>
        </form>
      </div>
      <Outlet />
    </div>
  );
}

export default Editmail;
