const BASE_URL = `${import.meta.env.VITE_API_URL}/account`;

export const login = async (loginData) => {
  const url = `${BASE_URL}/login`;

  if (!loginData.userName || !loginData.password) {
    return {
      success: false,
      message: "Invalid username or password.",
    };
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Success:", data);
      return {
        success: true,
        message: "Login successful.",
        data: {
          userName: data.username,
          userId: data.userid,
          token: data.token,
        },
      };
    } else {
      const contentType = response.headers.get("Content-Type");
      let errorBody;

      if (contentType && contentType.includes("application/json")) {
        errorBody = await response.json();
      } else if (contentType && contentType.includes("text/plain")) {
        errorBody = await response.text();
      } else {
        errorBody = await response.text();
      }

      console.error("Login failed:", errorBody);
      return {
        success: false,
        message: errorBody,
      };
    }
  } catch (error) {
    console.error("Error:", error);
    return {
      success: false,
      message: error.message || error.toString(),
    };
  }
};

export const register = async (registerData) => {
  const url = `${BASE_URL}/register`;

  if (
    !registerData.email ||
    registerData.email[0] === "@" ||
    registerData.email[registerData.email.length - 1] === "@" ||
    !registerData.email.includes("@")
  ) {
    return {
      success: false,
      message: "Invalid email address.",
    };
  }
  if (!registerData.userName || !registerData.password) {
    return {
      success: false,
      message: "Invalid username or password.",
    };
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registerData),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Success:", data);
      return {
        success: true,
        message: "Register completed successfully.",
      };
    } else {
      const contentType = response.headers.get("Content-Type");
      let errorBody;

      if (contentType && contentType.includes("application/json")) {
        errorBody = await response.json();
      } else if (contentType && contentType.includes("text/plain")) {
        errorBody = await response.text();
      } else {
        errorBody = await response.text();
      }

      console.error("Registration failed:", errorBody);
      return {
        success: false,
        message: errorBody,
      };
    }
  } catch (error) {
    console.error("Error:", error);
    return {
      success: false,
      message: error.message || error.toString(),
    };
  }
};
