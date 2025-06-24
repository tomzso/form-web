import React, { useState, useEffect } from "react";
import image1 from "../../assets/image111.jpg";
import image2 from "../../assets/image22.jpg";
import image3 from "../../assets/image33.jpg";
import "./imageSliderHome.css";
import { useNavigate } from "react-router-dom";

export const ImageSliderHome = () => {
  const images = [image1, image2, image3];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const navigate = useNavigate();

  const handleButtonClick = (path) => {
    navigate(path);
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false); // Start fade-out animation
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        setFade(true); // Start fade-in animation
      }, 500); // Match the fade-out duration
    }, 7000); // 7 seconds interval

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="slide-home-container">
      <div className="text-section">
        <h1>Welcome to Our Application</h1>
        <p>Easily manage your tasks, create surveys, and analyze responses in real-time. Join us today to get started!</p>
        <div className="button-group">
          <button className="login-btn" onClick={() => handleButtonClick(`${import.meta.env.VITE_API_BASE_URL}/login`)}>Login</button>
          <button className="register-btn" onClick={() => handleButtonClick(`${import.meta.env.VITE_API_BASE_URL}/register`)}>Sign Up</button>
        </div>
      </div>

      <div className={`slider-container ${fade ? "fade-in" : "fade-out"}`}>
        <img
          src={images[currentImageIndex]}
          alt={`Slide ${currentImageIndex + 1}`}
          className="slider-image"
        />
      </div>
    </div>
  );
};

export default ImageSliderHome;
