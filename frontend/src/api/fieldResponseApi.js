const BASE_URL = `${import.meta.env.VITE_API_URL}/fieldresponse`; // fieldResponse
import { postApi } from "./apis.js";

export const createFieldResponse = async (
  token,
  responseId,
  fieldId,
  value
) => {
  if (!token || token === "") {
    console.error("Error: Authorization token is required");
    return {
      success: false,
      message: "Authorization token is required.",
    };
  }

  const form = {
    responseId: responseId,
    fieldId: fieldId,
    value: value,
  };

  return await postApi(token, form, BASE_URL);
};
