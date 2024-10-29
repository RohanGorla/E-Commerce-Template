import React, { useState } from "react";
import { Outlet } from "react-router-dom";

function MerchantRegisterBase() {
  const [otp, setOtp] = useState(0);
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  return (
    <>
      <Outlet
        context={{
          otp,
          setOtp,
          mail,
          setMail,
          password,
          setPassword,
          companyName,
          setCompanyName,
        }}
      />
    </>
  );
}

export default MerchantRegisterBase;
