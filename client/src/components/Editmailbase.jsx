import React, { useState } from "react";
import { Outlet } from "react-router-dom";

function Editmailbase() {
  const [otp, setOtp] = useState(0);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const [newMail, setNewMail] = useState(userInfo.mailId);
  return (
    <>
      <Outlet context={{ otp, setOtp, newMail, setNewMail, userInfo }} />
    </>
  );
}

export default Editmailbase;
