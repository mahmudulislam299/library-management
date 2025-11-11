import React, { useContext, useState } from "react";
import "./Signin.css";
import axios from "axios";
import { AuthContext } from "../Context/AuthContext.js";

function Signin() {
  const [memberId, setMemberId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { dispatch } = useContext(AuthContext);

  const API_URL = process.env.REACT_APP_API_URL;

  const loginCall = async (userCredential, dispatch) => {
    dispatch({ type: "LOGIN_START" });
    setError("");
    try {
      const res = await axios.post(`${API_URL}/api/auth/signin`, userCredential);
      dispatch({ type: "LOGIN_SUCCESS", payload: res.data });
    } catch (err) {
      console.error(err);
      dispatch({ type: "LOGIN_FAILURE", payload: err });
      setError(err.response?.data?.message || "Wrong ID or password");
    }
  };

  const handleForm = (e) => {
    e.preventDefault();
    loginCall({ memberId, password }, dispatch);
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <form onSubmit={handleForm}>
          <h2 className="signin-title">Library Login</h2>
          <div className="line" />

          {error && <p className="error-message">{error}</p>}

          <div className="signin-fields">
            <label htmlFor="memberId">
              <b>Student ID or Employee ID</b>
            </label>
            <input
              className="signin-textbox"
              type="text"
              placeholder="Enter your ID"
              name="memberId"
              required
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
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
              value={password}
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
