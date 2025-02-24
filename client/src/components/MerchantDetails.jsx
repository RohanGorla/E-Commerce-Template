import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MerchantDetails.css";

function MerchantDetails() {
  const merchantInfo = JSON.parse(localStorage.getItem("merchantInfo"));
  const navigate = useNavigate();

  return (
    <div className="MerchantDetails_Page">
      <div className="MerchantDetails_Container">
        <div className="MerchantDetails_Header">
          <h1 className="MerchantDetails_Header--Title">Merchant Details</h1>
        </div>
        <div className="MerchantDetails_Content">
          <div className="MerchantDetails_Section">
            <div className="MerchantDetails_Labels_And_Information">
              <p className="MerchantDetails_Labels">Company</p>
              <p className="MerchantDetails_Information">
                {merchantInfo.company}
              </p>
            </div>
            <div className="MerchantDetails_Edit_Option">
              <button
                className="MerchantDetails_Edit_Button"
                onClick={() => {
                  navigate("editcompany");
                }}
              >
                Edit
              </button>
            </div>
          </div>
          <div className="MerchantDetails_Section">
            <div className="MerchantDetails_Labels_And_Information">
              <p className="MerchantDetails_Labels">Email</p>
              <p className="MerchantDetails_Information">
                {merchantInfo.mailId}
              </p>
            </div>
            <div className="MerchantDetails_Edit_Option">
              <button
                className="MerchantDetails_Edit_Button"
                onClick={() => {
                  navigate("editmail");
                }}
              >
                Edit
              </button>
            </div>
          </div>
          <div className="MerchantDetails_Section">
            <div className="MerchantDetails_Labels_And_Information">
              <p className="MerchantDetails_Labels">Password</p>
              <p className="MerchantDetails_Information">********</p>
            </div>
            <div className="MerchantDetails_Edit_Option">
              <button
                className="MerchantDetails_Edit_Button"
                onClick={() => {
                  navigate("editpassword");
                }}
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MerchantDetails;
