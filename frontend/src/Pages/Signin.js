import React, { useContext, useState } from "react";
import "./Signin.css";
import axios from "axios";
import { AuthContext } from "../Context/AuthContext.js";
import Switch from "@material-ui/core/Switch";

function Signin() {
  const [isStudent, setIsStudent] = useState(true);
  const [admissionId, setAdmissionId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { dispatch } = useContext(AuthContext);

  const API_URL = process.env.REACT_APP_API_URL;

  const loginCall = async (userCredential, dispatch) => {
    dispatch({ type: "LOGIN_START" });
    try {
      const res = await axios.post(API_URL + "api/auth/signin", userCredential);
      dispatch({ type: "LOGIN_SUCCESS", payload: res.data });
    } catch (err) {
      dispatch({ type: "LOGIN_FAILURE", payload: err });
      setError("Wrong Password or ID");
    }
  };

  const handleForm = (e) => {
    e.preventDefault();
    isStudent
      ? loginCall({ admissionId, password }, dispatch)
      : loginCall({ employeeId, password }, dispatch);
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <form onSubmit={handleForm}>
          <h2 className="signin-title">Library Login</h2>
          <div className="line" />

          <div className="persontype-question">
            <p>Staff Member?</p>
            <Switch
              onChange={() => setIsStudent(!isStudent)}
              color="primary"
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="signin-fields">
            <label htmlFor={isStudent ? "admissionId" : "employeeId"}>
              <b>{isStudent ? "Admission ID" : "Employee ID"}</b>
            </label>
            <input
              className="signin-textbox"
              type="text"
              placeholder={isStudent ? "Enter Admission ID" : "Enter Employee ID"}
              name={isStudent ? "admissionId" : "employeeId"}
              required
              onChange={(e) =>
                isStudent
                  ? setAdmissionId(e.target.value)
                  : setEmployeeId(e.target.value)
              }
            />

            <label htmlFor="password">
              <b>Password</b>
            </label>
            <input
              className="signin-textbox"
              type="password"
              placeholder="Enter Password"
              name="password"
              minLength="6"
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="signin-button">
            Log In
          </button>

          <a href="#forgot" className="forget-pass">
            Forgot password?
          </a>
        </form>

        <div className="signup-option">
          <p className="signup-question">
            Don't have an account? <strong>Contact Librarian</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signin;