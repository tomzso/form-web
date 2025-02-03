const BASE_URL = `${import.meta.env.VITE_API_URL}/formresponse`;
import { postApi, getApi } from "./apis.js";

export const createFormResponse = async (token, formId) => {
  if (!token || token === "") {
    console.error("Error: Authorization token is required");
    return {
      success: false,
      message: "Authorization token is required.",
    };
  }
  const formField = {};

  const url = `${BASE_URL}/${formId}`;

  return await postApi(token, formField, url);
};

export const getFormResponseByFormId = async (token, formId) => {
  if (!token || token === "") {
    console.error("Error: Authorization token is required");
    return {
      success: false,
      message: "Authorization token is required.",
    };
  }
  let url = `${BASE_URL}/formid/${formId}`;
  return await getApi(token, url);
};
