import React, { useState } from "react";
import { Outlet } from "react-router-dom";

function Editmailbase() {
  const [otp, setOtp] = useState(0);
  return (
    <>
      <Outlet context={[otp, setOtp]} />
    </>
  );
}

export default Editmailbase;
