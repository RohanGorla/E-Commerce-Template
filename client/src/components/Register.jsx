import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import "../styles/Register.css";

function Register() {
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const context = useOutletContext();
  const navigate = useNavigate();

  /* Get Register OTP API */

  async function addUser(e) {
    e.preventDefault();
    let otpResponse = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/getemailchangeotp`,
      {
        mail: context.mail,
        type: "register",
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
        <h2>Create new account!</h2>
        <p>
          Create your account and enjoy shopping for your favourite products!
        </p>
      </div>
      <form className="Register_Form" onSubmit={addUser}>
        <div className="Register_Firstname">
          <div className="Register_Field--Label_And_Count">
            <label>First name</label>
            <p className="Register_Field--Count">{context.first.length}/15</p>
          </div>
          <input
            className="Register_Firstname--Input"
            type="text"
            required
            onChange={(e) => {
              if (e.target.value.length <= 15) context.setFirst(e.target.value);
            }}
            value={context.first}
          ></input>
        </div>
        <div className="Register_Lastname">
          <div className="Register_Field--Label_And_Count">
            <label>Last name</label>
            <p className="Register_Field--Count">{context.last.length}/15</p>
          </div>
          <input
            className="Register_Lastname--Input"
            type="text"
            onChange={(e) => {
              if (e.target.value.length <= 15) context.setLast(e.target.value);
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
          <div className="Register_Password--Input_And_Eye">
            <input
              className="Register_Password--Input"
              type={showPassword ? "text" : "password"}
              required
              onChange={(e) => {
                context.setPassword(e.target.value);
              }}
              value={context.password}
            ></input>
            <FaEyeSlash
              className={
                showPassword
                  ? "Register_Password--Eye"
                  : "Register_Password--Eye--Inactive"
              }
              onClick={() => setShowPassword(false)}
            />
            <FaEye
              className={
                showPassword
                  ? "Register_Password--Eye--Inactive"
                  : "Register_Password--Eye"
              }
              onClick={() => setShowPassword(true)}
            />
          </div>
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
