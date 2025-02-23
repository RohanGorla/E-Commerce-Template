import React, { useState } from "react";
import "../styles/MerchantEditDetails.css";

function MerchantEditCompany() {
  const merchantInfo = JSON.parse(localStorage.getItem("merchantInfo"));
  const [newCompany, setNewCompany] = useState(merchantInfo.company);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  return (
    <div className="MerchantEditCompany_Page">
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

      <div className="MerchantEditDetail_Main">
        <div className="MerchantEditDetail_Header">
          <h2>Change your company name</h2>
          <p>Edit your company name and click save to save changes</p>
        </div>
        <div className="MerchantEditDetail_Container">
          <div className="MerchantEditDetail_Input_Container">
            <label>Company</label>
            <input
              className="MerchantEditDetail_Input MerchantEditCompany_Input"
              type="text"
              value={newCompany}
              onChange={(e) => {
                setNewCompany(e.target.value);
              }}
            ></input>
          </div>
          <div className="MerchantEditDetail_Savechanges_Option">
            <button>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MerchantEditCompany;
