import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useOutletContext } from "react-router-dom";
import "../styles/MerchantEditDetails.css";

function MerchantEditmail() {
  const navigate = useNavigate();
  const context = useOutletContext();
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function editmail(e) {
    e.preventDefault();
    if (context.merchantInfo.mailId === context.newMail) {
      setError(true);
      setErrorMessage("New and old emails cannot be the same!");
      setTimeout(() => {
        setError(false);
      }, 2500);
    } else {
      let otpResponse = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/getmerchantemailchangeotp`,
        {
          mail: context.newMail,
          company: context.merchantInfo.company,
        }
      );
      if (otpResponse.data.access) {
        context.setOtp(otpResponse.data.otp);
        navigate("editemailotp");
      } else {
        setError(true);
        setErrorMessage(otpResponse.data.errorMsg);
        setTimeout(() => {
          setError(false);
        }, 2500);
      }
    }
  }

  return (
    <div className="MerchantEditmail_Page">
      {/* ERROR MESSAGE BOX */}
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
      {/* EDIT MERCHANT EMAIL */}
      <div className="MerchantEditDetail_Main">
        <div className="MerchantEditDetail_Header">
          <h2>Change your company email.</h2>
          <p>Edit your company email id and click save to save changes.</p>
        </div>
        <form className="MerchantEditDetail_Container" onSubmit={editmail}>
          <div className="MerchantEditDetail_Input_Container">
            <label>New company email</label>
            <input
              className="MerchantEditDetail_Input MerchantEditEmail_Input"
              type="email"
              value={context.newMail}
              onChange={(e) => {
                context.setNewMail(e.target.value);
              }}
            ></input>
          </div>
          <div>
            <input
              className="MerchantEditDetail_Savechanges_Button"
              type="submit"
              value="Save"
            ></input>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MerchantEditmail;
