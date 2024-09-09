import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Credentials.css";

function Credentials() {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  return (
    <div className="Credentials_Main">
      <div className="Credential">
        <div className="Credential_Box">
          <p className="Credential_Labels">Name</p>
          <p className="Credential_Info">
            {userInfo.firstname} {userInfo.lastname}
          </p>
        </div>
        <div className="Edit_Btn">Edit</div>
      </div>
      <div className="Credential">
        <div className="Credential_Box">
          <p className="Credential_Labels">Email</p>
          <p className="Credential_Info">{userInfo.mailId}</p>
        </div>
        <div className="Edit_Btn">Edit</div>
      </div>
      <div className="Credential">
        <div className="Credential_Box">
          <p className="Credential_Labels">Password</p>
          <p className="Credential_Info">********</p>
        </div>
        <div className="Edit_Btn">Edit</div>
      </div>
    </div>
  );
}

export default Credentials;
