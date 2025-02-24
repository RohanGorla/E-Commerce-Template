import React from "react";
import { useOutletContext } from "react-router-dom";
import "../styles/MerchantEditDetails.css";

function MerchantEditmail() {
  const context = useOutletContext();

  return (
    <div className="MerchantEditmail_Page">
      <div className="MerchantEditDetail_Main">
        <div className="MerchantEditDetail_Header">
          <h2>Change your company email.</h2>
          <p>Edit your company email id and click save to save changes.</p>
        </div>
        <form className="MerchantEditDetail_Container">
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
              className="MerchantEditDetail_Savechanges_button"
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
