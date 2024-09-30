import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Register.css";

function Register() {
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

  async function addUser(e) {
    e.preventDefault();
    await axios
      .post(`${import.meta.env.VITE_BASE_URL}/addUser`, {
        first: first,
        last: last,
        mail: mail,
        password: password,
      })
      .then((response) => {
        console.log(response);
        if (response.data.access) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("mailId", mail);
          localStorage.setItem(
            "userInfo",
            JSON.stringify({
              firstname: first,
              lastname: last,
              mailId: mail,
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
            onChange={(e) => {
              setFirst(e.target.value);
            }}
            value={first}
          ></input>
        </div>
        <div className="Register_Lastname">
          <label>Last name</label>
          <input
            className="Register_Lastname--Input"
            type="text"
            onChange={(e) => {
              setLast(e.target.value);
            }}
            value={last}
          ></input>
        </div>
        <div className="Register_Email">
          <label>Email</label>
          <input
            className="Register_Email--Input"
            type="email"
            onChange={(e) => {
              setMail(e.target.value);
            }}
            value={mail}
          ></input>
        </div>
        <div className="Register_Password">
          <label>Password</label>
          <input
            className="Register_Password--Input"
            type="password"
            required
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            value={password}
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
