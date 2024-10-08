import React, { useState } from "react";
import axios from "axios";
import { Navigate, useNavigate } from "react-router-dom";
import "../styles/Edit.css";

function Editname() {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const usermail = userInfo.mailId;
  const username = userInfo.firstname + " " + userInfo.lastname;
  console.log(usermail);
  const [newFirst, setNewFirst] = useState(userInfo.firstname);
  const [newLast, setNewLast] = useState(userInfo.lastname);
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function editname() {
    if (newFirst.length !== 0) {
      let response = await axios.put("http://localhost:3000/editusername", {
        firstname: newFirst,
        lastname: newLast,
        usermail: usermail,
      });
      console.log(response.data.access);
      if (response.data.access) {
        localStorage.setItem(
          "userInfo",
          JSON.stringify({
            ...userInfo,
            firstname: newFirst,
            lastname: newLast,
          })
        );
        navigate("/account/credentials");
      }
    } else {
      setError(true);
      setErrorMsg("Firstname cannot be an empty string!");
    }
  }

  return (
    <div className="Edit_Main">
      <div
        className={
          error ? "Edit_ErrorMsgBox--visible" : "Edit_ErrorMsgBox--invisible"
        }
      >
        <p className="Edit_ErrorMsgHeading">Error!</p>
        <p className="Edit_ErrorMsg">{errorMsg}</p>
      </div>
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
  );
}

export default Editname;
