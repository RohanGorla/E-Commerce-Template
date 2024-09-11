import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Credentials.css";

function Credentials() {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const navigate = useNavigate();

  return (
    <div className="Credentials_Main">
      <div className="Credential">
        <div className="Credential_Box">
          <p className="Credential_Labels">Name</p>
          <p className="Credential_Info">
            {userInfo.firstname} {userInfo.lastname}
          </p>
        </div>
        <div
          className="Edit_Btn"
          onClick={() => {
            navigate("editname");
          }}
        >
          Edit
        </div>
      </div>
      <div className="Credential">
        <div className="Credential_Box">
          <p className="Credential_Labels">Email</p>
          <p className="Credential_Info">{userInfo.mailId}</p>
        </div>
        <div
          className="Edit_Btn"
          onClick={() => {
            navigate("email");
          }}
        >
          Edit
        </div>
      </div>
      <div className="Credential">
        <div className="Credential_Box">
          <p className="Credential_Labels">Password</p>
          <p className="Credential_Info">********</p>
        </div>
        <div
          className="Edit_Btn"
          onClick={() => {
            navigate("editpassword");
          }}
        >
          Edit
        </div>
      </div>
    </div>
  );
}

export default Credentials;
