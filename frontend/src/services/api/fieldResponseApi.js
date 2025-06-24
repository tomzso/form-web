const BASE_URL = `${import.meta.env.VITE_API_URL}/fieldresponse`; 
import { postApi } from "./apis.js";

export const createFieldResponse = async (token, responseId, fieldId, value) => {

  const form = {
    responseId: responseId,
    fieldId: fieldId,
    value: value,
  };

  return await postApi(token, form, BASE_URL);
};


