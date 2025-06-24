import { postApi, getApi } from "./apis.js";
const BASE_URL = `${import.meta.env.VITE_API_URL}/formresponse`;

export const createFormResponse = async (token, id) => {
  const formField = {};
  let url = `${BASE_URL}/${id}`;
  return await postApi(token, formField, url);

};

export const getFormResponseByFormId = async (token, formId) => {
  let url = `${BASE_URL}/formid/${formId}`;
  return await getApi(token, url);
};
