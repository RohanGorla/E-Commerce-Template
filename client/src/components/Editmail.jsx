import React, { useState } from "react";
import axios from "axios";
// import { nodemailer } from "nodemailer";
import { useNavigate, Outlet, useOutletContext } from "react-router-dom";
import "../styles/Edit.css";

function Editmail() {
  const navigate = useNavigate();
  const [otp, setOtp] = useOutletContext();
  console.log(otp);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const [newMail, setNewMail] = useState(userInfo.mailId);

  async function editmail(e) {
    e.preventDefault();
    let otpResponse = await axios.post(
      "http://localhost:3000/getemailchangeotp",
      {
        mail: newMail,
      }
    );
    console.log(otpResponse);
    if (otpResponse.data.access) {
      setOtp(otpResponse.data.otp);
      navigate("/account/credentials/email/emailotp");
    }

    // let response = await axios.put("http://localhost:3000/editusermail", {
    //   newmail: newMail,
    //   oldmail: userInfo.mailId,
    //   token: userInfo.token,
    // });
    // if (response.data.access) {
    //   localStorage.setItem(
    //     "userInfo",
    //     JSON.stringify({ ...userInfo, mailId: newMail })
    //   );
    //   let address = JSON.parse(localStorage.getItem("address"));
    //   localStorage.setItem(
    //     "address",
    //     JSON.stringify({ ...address, usermail: newMail })
    //   );
    //   navigate("/account/credentials");
    // }
  }

  return (
    <>
      <div className="Edit_Main">
        {/* <div
        className={
          error ? "Edit_ErrorMsgBox--visible" : "Edit_ErrorMsgBox--invisible"
        }
      >
        <p className="Edit_ErrorMsgHeading">Error!</p>
        <p className="Edit_ErrorMsg">{errorMsg}</p>
      </div> */}
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
              value={newMail}
              onChange={(e) => {
                setNewMail(e.target.value);
              }}
            ></input>
          </div>
          <div>
            <input className="Savechanges_Btn" type="submit"></input>
          </div>
        </form>
      </div>
      <Outlet />
    </>
  );
}

export default Editmail;
