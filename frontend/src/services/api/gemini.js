const BASE_URL = `${import.meta.env.VITE_API_URL}/gemini`; 
import { postApi } from "./apis.js";

export const createOptionsRequest = async (token, imageUrl, type, question) => {
  const formField = {
    "imageUrl": imageUrl,
    "type": type,
    "question": question,
    };

  const url = `${BASE_URL}/options`;
  return await postApi(token, formField, url);
};