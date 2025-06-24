import { handleJsonResponse, postJson } from "../../utils/apiHelper";

const BASE_URL = `${import.meta.env.VITE_API_URL}/account`;

export const login = async (loginData) => {
  const url = `${BASE_URL}/login`;

  if (!loginData.userName || !loginData.password) {
    return {
      success: false,
      message: "Invalid username or password.",
    };
  }

  const response = await postJson(url, loginData);
  if (response.success === false) return response;

  const result = await handleJsonResponse(response, "Login successful.");
  if (result.success && result.data) {
    return {
      ...result,
      data: {
        userName: result.data.username,
        userId: result.data.userid,
        token: result.data.token,
      },
    };
  }

  return result;
};

export const register = async (registerData) => {
  const url = `${BASE_URL}/register`;

  const { email, userName, password } = registerData;

  if (!email || email.startsWith("@") || email.endsWith("@") || !email.includes("@")) {
    return {
      success: false,
      message: "Invalid email address.",
    };
  }

  if (!userName || !password) {
    return {
      success: false,
      message: "Invalid username or password.",
    };
  }

  const response = await postJson(url, registerData);
  if (response.success === false) return response;

  const fullResult = await handleJsonResponse(response, "Register completed successfully.");

  return {
    success: fullResult.success,
    message: fullResult.message,
  };
};
