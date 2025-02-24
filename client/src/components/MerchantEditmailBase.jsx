import React, { useState } from "react";
import { Outlet } from "react-router-dom";

function MerchantEditmailBase() {
  const [otp, setOtp] = useState(0);
  const merchantInfo = JSON.parse(localStorage.getItem("merchantInfo"));
  const [newMail, setNewMail] = useState(merchantInfo.mailId);

  return (
    <>
      <Outlet context={{ otp, setOtp, newMail, setNewMail, merchantInfo }} />
    </>
  );
}

export default MerchantEditmailBase;
