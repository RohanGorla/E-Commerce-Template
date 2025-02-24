import React, { useState } from "react";
import "../styles/MerchantEditDetails.css";

function MerchantEditPassword() {
  const merchantInfo = JSON.parse(localStorage.getItem("merchantInfo"));
  const mailId = merchantInfo.mailId;
  const token = merchantInfo.token;
  const [pass, setPass] = useState("");
  const [newpass, setNewpass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  return (
    <div className="MerchantEditPassword_Page">
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
      {/* Edit Password */}
      <div className="MerchantEditDetail_Main">
        <div className="MerchantEditDetail_Header">
          <h2>Edit your password.</h2>
          <p>Edit your password and click save to save changes.</p>
        </div>
        <div className="MerchantEditDetail_Container">
          <div className="MerchantEditDetail_Input_Container">
            <div>
              <label>Enter old password</label>
            </div>
            <input
              className="MerchantEditDetail_Input MerchantEditPassword_Input"
              type="password"
              value={pass}
              onChange={(e) => {
                setPass(e.target.value);
              }}
            ></input>
          </div>
          <div className="MerchantEditDetail_Input_Container">
            <div>
              <label>Enter new password</label>
            </div>
            <input
              className="MerchantEditDetail_Input MerchantEditPassword_Input"
              type="password"
              value={newpass}
              onChange={(e) => {
                setNewpass(e.target.value);
              }}
            ></input>
          </div>
          <div className="MerchantEditDetail_Input_Container">
            <div>
              <label>Re-enter new password</label>
            </div>
            <input
              className="MerchantEditDetail_Input MerchantEditPassword_Input"
              type="password"
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
              }}
            ></input>
          </div>
          <div>
            <button className="MerchantEditDetail_Savechanges_Button">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MerchantEditPassword;
