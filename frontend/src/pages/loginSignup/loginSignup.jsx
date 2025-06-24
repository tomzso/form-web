import React, { useState, useContext, useEffect } from "react";
import "./loginSignup.css";
import { FormContext } from "../../context/form-context";
import { useNavigate, useLocation } from "react-router-dom";
import { handleSubmitLoginSignup } from "../../utils/handleSubmitLoginSignup";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faLock,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";

export const LoginSignup = ({ setToken, setUserName, setUserId }) => {
  const {
    name,
    email,
    password,
    handleNameChange,
    handleEmailChange,
    handlePasswordChange,
    setUserNameContext,
    setTokenContext,
    setUserIdContext,
  } = useContext(FormContext);

  const [action, setAction] = useState("Login");
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loginFailure, setLoginFailure] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [registerFailure, setRegisterFailure] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === `${import.meta.env.VITE_API_BASE_URL}/register`) {
      setAction("Sign Up");
    } else if (location.pathname === `${import.meta.env.VITE_API_BASE_URL}/login`) {
      setAction("Login");
    }
  }, [location]);

  const handleSubmit = () => {
    handleSubmitLoginSignup({
      action,
      name,
      password,
      email,
      setSuccessMessage,
      setLoginSuccess,
      setLoginFailure,
      setRegisterSuccess,
      setRegisterFailure,
      setErrorMessage,
      setTokenContext,
      setUserNameContext,
      setUserIdContext,
      setUserName,
      setToken,
      setUserId,
      navigate,
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div>
      <div className="container">
        <div className="header">
          <div className="text">{action}</div>
          <div className="underline"></div>
        </div>
        <div className="inputs">
          <div className="input">
            <FontAwesomeIcon icon={faUser} className="fixed-width-icon" />
            <input placeholder="Name" onChange={handleNameChange} />
          </div>

          {action === "Sign Up" && (
  
              <div className="input">
                <FontAwesomeIcon icon={faEnvelope} className="fixed-width-icon" />
                <input type="email" placeholder="Email" onChange={handleEmailChange} />

            </div>
          )}
          <div className="input">
            <FontAwesomeIcon icon={faLock} className="fixed-width-icon" />
            <input
              type="password"
              placeholder="Password"
              onChange={handlePasswordChange}
              onKeyDown={handleKeyDown}
            />
          </div>

        </div>
        <div className="submit-container">
          <div
            className={`submit ${action === "Sign Up" ? "active" : "inactive"}`}
            onClick={() => navigate(`${import.meta.env.VITE_API_BASE_URL}/register`)}
          >
            Sign Up
          </div>
          <div
            className={`submit ${action === "Login" ? "active" : "inactive"}`}
            onClick={() => navigate(`${import.meta.env.VITE_API_BASE_URL}/login`)}
          >
            Login
          </div>
        </div>
        <div className="next" onClick={handleSubmit}>
          Next
        </div>
      </div>

      {loginSuccess && <div className="successDialog">Login Success!</div>}
      {loginFailure && <div className="failureDialog">{errorMessage}</div>}
      {registerSuccess && (
        <div className="successDialog">
          Registration completed successfully! Log in to continue.
        </div>
      )}
      {registerFailure && <div className="failureDialog">{errorMessage}</div>}
    </div>
  );
};

export default LoginSignup;
