// handleSubmitLoginSignup.js
import { login, register } from "../services/api/userApi";

export const handleSubmitLoginSignup = async ({
  action,
  name,
  password,
  email,
  setSuccessMessage,
  setLoginSuccess,
  setLoginFailure,
  setRegisterSuccess,
  setRegisterFailure,
  setErrorMessage,
  setTokenContext,
  setUserNameContext,
  setUserIdContext,
  setUserName,
  setToken,
  setUserId,
  navigate,
}) => {
  if (action === "Login") {
    const loginData = {
      userName: name,
      password,
    };
    const response = await login(loginData);

    if (response.success) {
      setSuccessMessage(response.message);
      setLoginSuccess(true);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userName", response.data.userName);
      localStorage.setItem("userId", response.data.userId);

      setTimeout(() => {
        setTokenContext(response.data.token);
        setUserNameContext(response.data.userName);
        setUserIdContext(response.data.userId);

        setUserName(response.data.userName);
        setToken(response.data.token);
        setUserId(response.data.userId);

        setLoginSuccess(false);
        navigate(import.meta.env.VITE_API_BASE_URL);
      }, 1000);
    } else {
      setErrorMessage(response.message);
      setLoginFailure(true);

      setTimeout(() => {
        setLoginFailure(false);
      }, 1000);
    }
  } else {
    const registerData = {
      userName: name,
      password,
      email,
    };
    const response = await register(registerData);

    if (response.success) {
      setSuccessMessage(response.message);
      setRegisterSuccess(true);

      setTimeout(() => {
        setRegisterSuccess(false);
        navigate(`${import.meta.env.VITE_API_BASE_URL}/login`);

        setUserName(response.data.userName);
        setUserId(response.data.userId);
        setToken(response.data.token);
      }, 1000);
    } else {
      setErrorMessage(response.message);
      setRegisterFailure(true);

      setTimeout(() => {
        setRegisterFailure(false);
      }, 3000);
    }
  }
};

