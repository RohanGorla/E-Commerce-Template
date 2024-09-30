import React, { useState } from "react";
import { Outlet } from "react-router-dom";

function Registerbase() {
  const [otp, setOtp] = useState(0);
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
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
          first,
          setFirst,
          last,
          setLast,
        }}
      />
    </>
  );
}

export default Registerbase;
