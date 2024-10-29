import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Edit.css";

function Editpassword() {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const usermail = userInfo.mailId;
  const token = userInfo.token;
  const [pass, setPass] = useState("");
  const [newpass, setNewpass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  /* Edit Password API */

  async function editpassword() {
    if (newpass.length !== 0) {
      if (newpass === confirm) {
        let response = await axios.put(
          `${import.meta.env.VITE_BASE_URL}/edituserpassword`,
          {
            mail: usermail,
            token: token,
            old: pass,
            new: newpass,
          }
        );
        if (response.data.access) {
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
        setErrorMessage("Passwords do not match!");
        setTimeout(() => {
          setError(false);
        }, 2500);
      }
    } else {
      setSuccess(false);
      setError(true);
      setErrorMessage("Password cannot be empty!");
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
      {/* Edit Password */}
      <div className="Edit_Main">
        {/*
        //This is an old version of the Error message box. This is just for reference! 
        
        <div
          className={
            error ? "Edit_ErrorMsgBox--visible" : "Edit_ErrorMsgBox--invisible"
          }
        >
          <p className="Edit_ErrorMsgHeading">Error!</p>
          <p className="Edit_ErrorMsg">{errorMsg}</p>
        </div> */}
        <div className="Edit_Notes">
          <h2>Edit your password.</h2>
          <p>Edit your password and click save to save changes.</p>
        </div>
        <div className="Edit_Box">
          <div className="Edit_Input">
            <div>
              <label>Enter old password</label>
            </div>
            <input
              className="Editpassword_Input"
              type="password"
              value={pass}
              onChange={(e) => {
                setPass(e.target.value);
              }}
            ></input>
          </div>
          <div className="Edit_Input">
            <div>
              <label>Enter new password</label>
            </div>
            <input
              className="Editpassword_Input"
              type="password"
              value={newpass}
              onChange={(e) => {
                setNewpass(e.target.value);
              }}
            ></input>
          </div>

          <div className="Edit_Input">
            <div>
              <label>Re-enter new password</label>
            </div>
            <input
              className="Editpassword_Input"
              type="password"
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
              }}
            ></input>
          </div>
          <div>
            <button className="Savechanges_Btn" onClick={editpassword}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Editpassword;
