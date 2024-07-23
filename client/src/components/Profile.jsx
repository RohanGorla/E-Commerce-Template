import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Profile() {
  useEffect(() => {
    async function getdetails() {
      let response = await axios.post("http://localhost:3000/authenticateuser");
    }
  }, []);
  return <div></div>;
}

export default Profile;
