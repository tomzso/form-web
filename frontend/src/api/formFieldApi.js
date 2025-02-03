import { deleteApi, postApi } from "./apis.js";

const BASE_URL = `${import.meta.env.VITE_API_URL}/formfield`;

export const createFormField = async (
  token,
  label,
  fieldType,
  required,
  formId,
  imageUrl
) => {
  if (!token || token === "") {
    console.error("Error: Authorization token is required");
    return {
      success: false,
      message: "Authorization token is required.",
    };
  }
  if (!label || label === "") {
    console.error("Error: Label is required");
    return {
      success: false,
      message: "Label is required.",
    };
  }
  if (!fieldType || fieldType === "") {
    console.error("Error: Field type is required");
    return {
      success: false,
      message: "Field type is required.",
    };
  }

  const formField = {
    label: label,
    fieldType: fieldType,
    required: required,
    imageUrl: imageUrl,
  };

  const url = `${BASE_URL}/${formId}`;

  return await postApi(token, formField, url);
};

export const deleteFormField = async (token, formFieldId) => {
  const url = `${BASE_URL}/${formFieldId}`;

  if (!token || token === "") {
    console.error("Error: Authorization token is required");
    return;
  }

  return await deleteApi(token, url);
};
