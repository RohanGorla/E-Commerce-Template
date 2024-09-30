import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import axios from "axios";
import "../styles/Register.css";

function Registerotp() {
  const context = useOutletContext();
  const navigate = useNavigate();
  const [OTP, setOTP] = useState("");
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function checkotp() {
    if (context.otp === Number(OTP)) {
      await axios
        .post(`${import.meta.env.VITE_BASE_URL}/addUser`, {
          first: context.first,
          last: context.last,
          mail: context.mail,
          password: context.password,
        })
        .then((response) => {
          console.log(response);
          if (response.data.access) {
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("mailId", context.mail);
            localStorage.setItem(
              "userInfo",
              JSON.stringify({
                firstname: context.first,
                lastname: context.last,
                mailId: context.mail,
                token: response.data.token,
              })
            );
            navigate("/account");
          } else {
            setError(true);
            setErrorMsg(response.data.errorMsg);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      setError(true);
      setErrorMsg("Wrong OTP!");
    }
  }
  return (
    <div className="Register_Main">
      <div
        className={
          error
            ? "Register_ErrorMsgBox--visible"
            : "Register_ErrorMsgBox--invisible"
        }
      >
        <p className="Register_ErrorMsgHeading">Error!</p>
        <p className="Register_ErrorMsg">{errorMsg}</p>
      </div>
      <div className="Register_Notes">
        <h2>Enter OTP.</h2>
        <p>Enter the otp that was sent to {context.mail}.</p>
      </div>
      <div className="Register_Box">
        <div className="Register_Input">
          <div>
            <label>OTP</label>
          </div>
          <input
            className="Registerotp_Input"
            type="text"
            value={OTP}
            onChange={(e) => {
              setOTP(e.target.value);
            }}
          ></input>
        </div>
        <div>
          <button className="Register_Savechanges_Btn" onClick={checkotp}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default Registerotp;
