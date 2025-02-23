import React, { useEffect, useState } from "react";
import "../styles/MerchantDetails.css";

function MerchantDetails() {
  const merchantInfo = JSON.parse(localStorage.getItem("merchantInfo"));

  return (
    <div className="MerchantDetails_Page">
      <div className="MerchantDetails_Container">
        <div className="MerchantDetails_Header">
          <h1 className="MerchantDetails_Header--Title">Merchant Details</h1>
        </div>
        <div className="MerchantDetails_Content">
          <div className="MerchantDetails_Section">
            <p className="MerchantDetails_Labels">Company</p>
            <p className="MerchantDetails_Information">
              {merchantInfo.company}
            </p>
          </div>
          <div className="MerchantDetails_Section">
            <p className="MerchantDetails_Labels">Email</p>
            <p className="MerchantDetails_Information">{merchantInfo.mailId}</p>
          </div>
          <div className="MerchantDetails_Section">
            <p className="MerchantDetails_Labels">Password</p>
            <p className="MerchantDetails_Information">********</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MerchantDetails;
