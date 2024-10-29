import React, { useState } from "react";
import axios from "axios";
import { Navigate, useNavigate } from "react-router-dom";
import "../styles/Edit.css";

function Editname() {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const usermail = userInfo.mailId;
  const username = userInfo.firstname + " " + userInfo.lastname;
  const [newFirst, setNewFirst] = useState(userInfo.firstname);
  const [newLast, setNewLast] = useState(userInfo.lastname);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  /* Edit User Name API */

  async function editname() {
    if (newFirst.length !== 0) {
      if (userInfo.firstname == newFirst && userInfo.lastname == newLast) {
        setSuccess(false);
        setError(true);
        setErrorMessage("Old and New usernames cannot be the same!");
        setTimeout(() => {
          setError(false);
        }, 2500);
      } else {
        let response = await axios.put(`${import.meta.env.VITE_BASE_URL}/editusername`, {
          firstname: newFirst,
          lastname: newLast,
          usermail: usermail,
        });
        if (response.data.access) {
          localStorage.setItem(
            "userInfo",
            JSON.stringify({
              ...userInfo,
              firstname: newFirst,
              lastname: newLast,
            })
          );
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
      }
    } else {
      setSuccess(false);
      setError(true);
      setErrorMessage("Firstname cannot be an empty string!");
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
      {/* Edit Name */}
      <div className="Edit_Main">
        <div className="Edit_Notes">
          <h2>Change your name</h2>
          <p>Edit your user name and click save to save changes</p>
        </div>
        <div className="Edit_Box">
          <div className="Edit_Input">
            <label>First name</label>
            <input
              className="Editname_Input"
              type="text"
              value={newFirst}
              onChange={(e) => {
                setNewFirst(e.target.value);
              }}
            ></input>
          </div>
          <div className="Edit_Input">
            <label>Last name</label>
            <input
              className="Editname_Input"
              type="text"
              value={newLast}
              onChange={(e) => {
                setNewLast(e.target.value);
              }}
            ></input>
          </div>
          <div>
            <button className="Savechanges_Btn" onClick={editname}>
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Editname;
