import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FormContext } from "../../context/form-context";
import "./navbar.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faScrewdriverWrench,
  faRightToBracket,
  faArrowRightToBracket,
  faUser
} from "@fortawesome/free-solid-svg-icons";

export const Navbar = ({ setToken, setUserName, setUserId }) => {
  const {
    userName,
    setUserNameContext,
    setTokenContext,
    setUserIdContext,
  } = useContext(FormContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate()
  let navbarClass;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    setMenuOpen(false);

    setTimeout(() => {
      setUserNameContext("");
      setTokenContext("");
      setUserIdContext("");
      navigate(`${import.meta.env.VITE_API_BASE_URL}/login`);
      setToken("");
      setUserName("");
      setUserId("");
    }, 1000);
  };

  useEffect(() => {
    console.log("User Name:", userName);
  }, [userName]);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className={`navbar ${navbarClass}`}>
      <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div className={`left-links ${menuOpen ? "active" : ""}`}>
         
        <Link to={import.meta.env.VITE_API_BASE_URL} onClick={closeMenu}> <FontAwesomeIcon icon={faHome}/> Home</Link>
        <Link to={`${import.meta.env.VITE_API_BASE_URL}/formBuilder`} onClick={closeMenu}> <FontAwesomeIcon icon={faScrewdriverWrench}/> Build Form</Link>
      </div>
      <div className={`right-links ${menuOpen ? "active" : ""}`}>
        {userName ? (
          <>
            <span className="welcome-message">Welcome, {userName}!</span>
            <button className="logout-button" onClick={handleLogout}>
              <FontAwesomeIcon icon={faRightToBracket} /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to={`${import.meta.env.VITE_API_BASE_URL}/login`} onClick={closeMenu}> <FontAwesomeIcon icon={faRightToBracket}/>  Login</Link>
            <Link to={`${import.meta.env.VITE_API_BASE_URL}/register`} onClick={closeMenu}><FontAwesomeIcon icon={faUser}/> Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};
