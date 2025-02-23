import React, { useState } from "react";
import "../styles/MerchantEditDetails.css";

function MerchantEditCompany() {
  const merchantInfo = JSON.parse(localStorage.getItem("merchantInfo"));
  const [newCompany, setNewCompany] = useState(merchantInfo.company);

  return (
    <div className="MerchantEditCompany_Page">
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
