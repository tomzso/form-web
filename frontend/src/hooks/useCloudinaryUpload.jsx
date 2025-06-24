import { useEffect, useRef, useState } from "react";

export const useCloudinaryUpload = () => {
  const [imageUrl, setImageUrl] = useState(null);
  const cloudinaryRef = useRef();
  const widgetRef = useRef();

  useEffect(() => {
    cloudinaryRef.current = window.cloudinary;
    widgetRef.current = cloudinaryRef.current.createUploadWidget(
      {
        cloudName: import.meta.env.VITE_API_CLOUD_NAME,
        uploadPreset: import.meta.env.VITE_API_UPLOAD_PRESET,
        multiple: false,
        mime_types: [
          { extensions: ["jpg", "jpeg", "png", "gif", "webp"] },
        ],
      },
      (error, result) => {
        if (error) {
          console.error("Upload Widget Error:", error);
        }
        if (result.event === "success") {
          const uploadedImageUrl = result.info.secure_url;
          console.log("Uploaded Image Data:", result.info);
          setImageUrl(uploadedImageUrl);
          
        }
      }
    );
  }, []);


  const clearImage = () => {
    setImageUrl(null);
  };

  return { imageUrl, widgetRef, clearImage };
};
