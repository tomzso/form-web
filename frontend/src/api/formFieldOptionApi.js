import { postApi } from "./apis.js";
const BASE_URL = `${import.meta.env.VITE_API_URL}/formfieldoption`;

export const createFormFieldOption = async (
  token,
  optionValue,
  isCorrect,
  formFieldId
) => {
  if (!token || token === "") {
    console.error("Error: Authorization token is required");
    return {
      success: false,
      message: "Authorization token is required.",
    };
  }

  const formFieldOption = {
    optionValue: optionValue,
    order: 0, // default
    isCorrect: isCorrect,
  };

  const url = `${BASE_URL}/${formFieldId}`;

  return await postApi(token, formFieldOption, url);
};

export const createFormFieldOptionByUserAnswer = async (
  token,
  optionValue,
  isCorrect,
  formFieldId
) => {
  if (!token || token === "") {
    console.error("Error: Authorization token is required");
    return {
      success: false,
      message: "Authorization token is required.",
    };
  }

  const formFieldOption = {
    optionValue: optionValue,
    order: 0, // default
    isCorrect: isCorrect,
  };

  const url = `${BASE_URL}/text/${formFieldId}`;

  return await postApi(token, formFieldOption, url);
};
