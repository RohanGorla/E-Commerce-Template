import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import axios from "axios";
import "../styles/Register.css";

function Register() {
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const context = useOutletContext();
  const navigate = useNavigate();

  async function addUser(e) {
    e.preventDefault();
    let otpResponse = await axios.post(
      "http://localhost:3000/getemailchangeotp",
      {
        mail: context.mail,
      }
    );
    if (otpResponse.data.access) {
      context.setOtp(otpResponse.data.otp);
      navigate("registerotp");
    } else {
      setError(true);
      setErrorMsg(otpResponse.data.errorMsg);
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
        <h2>Create Account!</h2>
      </div>
      <form className="Register_Form" onSubmit={addUser}>
        <div className="Register_Firstname">
          <label>First name</label>
          <input
            className="Register_Firstname--Input"
            type="text"
            required
            onChange={(e) => {
              context.setFirst(e.target.value);
            }}
            value={context.first}
          ></input>
        </div>
        <div className="Register_Lastname">
          <label>Last name</label>
          <input
            className="Register_Lastname--Input"
            type="text"
            onChange={(e) => {
              context.setLast(e.target.value);
            }}
            value={context.last}
          ></input>
        </div>
        <div className="Register_Email">
          <label>Email</label>
          <input
            className="Register_Email--Input"
            type="email"
            required
            onChange={(e) => {
              context.setMail(e.target.value);
            }}
            value={context.mail}
          ></input>
        </div>
        <div className="Register_Password">
          <label>Password</label>
          <input
            className="Register_Password--Input"
            type="password"
            required
            onChange={(e) => {
              context.setPassword(e.target.value);
            }}
            value={context.password}
          ></input>
        </div>
        <div className="Register_Signup">
          <input type="submit" value="Sign up"></input>
        </div>
      </form>
      {/* <div>
        <button onClick={mail && password ? addUser : null}>Sign up</button>
      </div> */}
      <div className="Register_Login">
        <p>Already have an account?</p>
        <button
          onClick={() => {
            navigate("/account/login");
          }}
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default Register;
