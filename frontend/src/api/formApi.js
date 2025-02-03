import { postApi, getApi, putApi } from "./apis.js";

const BASE_URL = `${import.meta.env.VITE_API_URL}/form`;

export const createForm = async (token, formTitle, formDescription, type) => {
  if (!token || token === "") {
    console.error("Error: Authorization token is required");
    return {
      success: false,
      message: "Authorization token is required.",
    };
  }
  if (!formTitle || formTitle === "") {
    console.error("Error: Form title is required");
    return {
      success: false,
      message: "Form title is required.",
    };
  }

  const form = {
    title: formTitle,
    description: formDescription,
    status: "draft", // default status,
    type: type,
  };

  return await postApi(token, form, BASE_URL);
};

export const getFormByUser = async (token) => {
  let url = `${BASE_URL}/user`;
  return await getApi(token, url);
};
export const getFormByUrl = async (token, url) => {
  let link = `${BASE_URL}/url/${url}`;
  return await getApi(token, link);
};

export const updateForm = async (
  token,
  formId,
  formTitle,
  formDescription,
  type
) => {
  if (!token || token === "") {
    console.error("Error: Authorization token is required");
    return {
      success: false,
      message: "Authorization token is required.",
    };
  }
  if (!formTitle || formTitle === "") {
    console.error("Error: Form title is required");
    return {
      success: false,
      message: "Form title is required.",
    };
  }

  const form = {
    title: formTitle,
    description: formDescription,
    status: "draft", // default status,
    type: type,
  };

  return await putApi(token, form, `${BASE_URL}/${formId}`);
};

export const deleteForm = async (token, id) => {
  if (!token) {
    console.error("Authorization token and orderId are required.");
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      console.log("Form deleted successfully");
    } else {
      console.error("Failed to delete the order:", await response.text());
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
