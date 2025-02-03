import React, { useState, useContext, useEffect } from "react";
import "./loginSignup.css";
import user_icon from "../../assets/person.png";
import email_icon from "../../assets/email.png";
import password_icon from "../../assets/password.png";
import { FormContext } from "../../context/form-context";
import { login, register } from "../../api/userApi";
import { useNavigate, useLocation } from "react-router-dom";

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
    setUserIdContext

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

  // Update action based on URL
  useEffect(() => {
    if (location.pathname === `${import.meta.env.VITE_API_BASE_URL}/register`) {
      setAction("Sign Up");
    } else if (location.pathname === `${import.meta.env.VITE_API_BASE_URL}/login`) {
      setAction("Login");
    }
  }, [location]);

  const handleSubmit = async () => {
    if (action === "Login") {
      const loginData = {
        userName: name,
        password: password,
      };
      const response = await login(loginData);

      if (response.success) {
        setSuccessMessage(response.message);
        setLoginSuccess(true);

        // Update localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userName', response.data.userName);
        localStorage.setItem('userId', response.data.userId);

        setTimeout(() => {
          // Update App context
          setTokenContext(response.data.token);
          setUserNameContext(response.data.userName);
          setUserIdContext(response.data.userId);
          // Update App state
          setUserName(response.data.userName);
          setToken(response.data.token);
          setUserId(response.data.userId);

          setLoginSuccess(false);
          navigate(import.meta.env.VITE_API_BASE_URL);

        }, 1000);
      } else {
        setErrorMessage(response.message);
        setLoginFailure(true);

        setTimeout(() => {
          setLoginFailure(false);
        }, 1000);
      }
    } else {
      const registerData = {
        userName: name,
        password: password,
        email: email,
      };
      const response = await register(registerData);

      if (response.success) {
        setSuccessMessage(response.message);
        setRegisterSuccess(true);

        setTimeout(() => {
          setRegisterSuccess(false);
          navigate(`${import.meta.env.VITE_API_BASE_URL}/login`);

          // Update App state
          setUserName(response.data.userName);
          setUserId(response.data.userId);
          setToken(response.data.token);
        }, 1000);
      } else {
        setErrorMessage(response.message);
        setRegisterFailure(true);

        setTimeout(() => {
          setRegisterFailure(false);
        }, 3000);
      }
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="center-container">
      <div className="container">
        <div className="header">
          <div className="text">{action}</div>
          <div className="underline"></div>
        </div>
        <div className="inputs">
          <div className="input">
            <img src={user_icon} alt="" />
            <input type="text" placeholder="Name" onChange={handleNameChange} />
          </div>
          {action === "Sign Up" && (
            <div className="inputs">
              <div className="input">
                <img src={email_icon} alt="" />
                <input
                  type="email"
                  placeholder="Email Id"
                  onChange={handleEmailChange}
                />
              </div>
            </div>
          )}
          <div className="input">
            <img src={password_icon} alt="" />
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
