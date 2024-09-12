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
  const [errorMsg, setErrorMsg] = useState("");

  async function editpassword() {
    if (newpass.length !== 0) {
      if (newpass === confirm) {
        let response = await axios.put(
          "http://localhost:3000/edituserpassword",
          {
            mail: usermail,
            token: token,
            old: pass,
            new: newpass,
          }
        );
        if (response.data.access) {
          console.log("password changed successfully!");
          navigate("/account/credentials");
        } else {
          console.log("something wrong");
          setError(true);
          setErrorMsg(response.data.error);
        }
      } else {
        console.log("New passwords donot match!");
        setError(true);
        setErrorMsg("New passwords donot match!");
      }
    } else {
      setError(true);
      setErrorMsg("Passwords cannot be empty!");
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
  );
}

export default Editpassword;
