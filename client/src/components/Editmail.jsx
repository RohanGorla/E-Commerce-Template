import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Outlet, useOutletContext } from "react-router-dom";
import "../styles/Edit.css";

function Editmail() {
  const navigate = useNavigate();
  const context = useOutletContext();
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function editmail(e) {
    e.preventDefault();
    if (context.userInfo.mailId === context.newMail) {
      setError(true);
      setErrorMsg("New and old emails cannot be the same!");
    } else {
      let otpResponse = await axios.post(
        "http://localhost:3000/getemailchangeotp",
        {
          mail: context.newMail,
        }
      );
      console.log(otpResponse);
      if (otpResponse.data.access) {
        context.setOtp(otpResponse.data.otp);
        navigate("/account/credentials/email/emailotp");
      } else {
        setError(true);
        setErrorMsg(otpResponse.data.error);
      }
    }
  }

  return (
    <>
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
            <input className="Savechanges_Btn" type="submit" value="Save"></input>
          </div>
        </form>
      </div>
      <Outlet />
    </>
  );
}

export default Editmail;
