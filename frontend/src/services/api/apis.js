import { apiFetch } from "../../utils/apiHelper.js";

export const postApi = async (token, data, url) => {
  return await apiFetch("POST", url, token, data);
};

export const getApi = async (token, url) => {
  return await apiFetch("GET", url, token);
};

export const putApi = async (token, data, url) => {
  return await apiFetch("PUT", url, token, data);
};

export const deleteApi = async (token, url) => {
  return await apiFetch("DELETE", url, token);
};
