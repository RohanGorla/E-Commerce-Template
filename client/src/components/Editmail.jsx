import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Edit.css";

function Editmail() {
  const navigate = useNavigate()
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const [newMail, setNewMail] = useState(userInfo.mailId);

  async function editmail() {
    let response = await axios.put("http://localhost:3000/editusermail", {
      newmail: newMail,
      oldmail: userInfo.mailId,
      token: userInfo.token,
    });
    if (response.data.access) {
      localStorage.setItem(
        "userInfo",
        JSON.stringify({ ...userInfo, mailId: newMail })
      );
      let address = JSON.parse(localStorage.getItem("address"));
      localStorage.setItem(
        "address",
        JSON.stringify({ ...address, usermail: newMail })
      );
      navigate("/account/credentials");
    }
  }

  return (
    <div className="Edit_Main">
      <div className="Edit_Notes">
        <h2>Edit your mail.</h2>
        <p>Edit your mail id and click save to save changes.</p>
      </div>
      <div className="Edit_Box">
        <div>
          <input
            type="text"
            value={newMail}
            onChange={(e) => {
              setNewMail(e.target.value);
            }}
          ></input>
        </div>
        <div>
          <button className="Savechanges_Btn" onClick={editmail}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default Editmail;
