import React from "react";
import { useOutletContext } from "react-router-dom";

function Emailotp() {
  const [otp] = useOutletContext();
  return (
    <div>
      <h2>{otp}</h2>
    </div>
  );
}

export default Emailotp;
