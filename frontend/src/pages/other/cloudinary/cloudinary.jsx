import React, { useEffect, useRef, useState } from "react";

const UploadWidget = () => {
  const [imageUrl, setImageUrl] = useState(null); // State to store the image URL
  const cloudinaryRef = useRef();
  const widgetRef = useRef();

  useEffect(() => {
    cloudinaryRef.current = window.cloudinary;
    widgetRef.current = cloudinaryRef.current.createUploadWidget(
      {
        cloudName: "duhzdcpmt",
        uploadPreset: "vrl3wgym",
        multiple: false, // Disable the "Upload More" button
        mime_types: [
          { extensions: ["jpg", "jpeg", "png", "gif", "webp"] }, // Only image file types
        ],
      },
      (error, result) => {
        if (error) {
          console.error("Upload Widget Error:", error); // Log any errors
        }
        if (result.event === "success") {
          // If the upload is successful, update the image URL in state
          const uploadedImageUrl = result.info.secure_url;
          console.log("Uploaded Image Data:", result.info); // Log the result
          setImageUrl(uploadedImageUrl); // Set the image URL in state
        }
      }
    );
  }, []);

  return (
    <div className="upload-container">
      <button onClick={() => widgetRef.current.open()}>Upload Image</button>
      {imageUrl && (
        <div className="image-preview">
          <h3>Rendered Image:</h3>
          <img
            src={imageUrl}
            alt="Uploaded"
            style={{ maxWidth: "100%", height: "auto", marginTop: "20px" }}
          />
        </div>
      )}
    </div>
  );
};

export const Cloudinary = () => {
  return (
    <div>
      <h1>Cloudinary Upload</h1>
      <UploadWidget />
    </div>
  );
};

export default UploadWidget;
