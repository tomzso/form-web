export const requireAuthToken = (token) => {
  if (!token || token === "") {
    console.error("Error: Authorization token is required");
    return {
      success: false,
      message: "Authorization token is required.",
    };
  }
}

export const buildHeaders = (token, contentType = "application/json") => ({
  "Content-Type": contentType,
  Authorization: `Bearer ${token}`,
});

export const handleResponse = async (response) => {
  const contentType = response.headers.get("Content-Type");

  if (contentType && contentType.includes("application/json")) {
    const data = await response.json();
    return {
      success: response.ok,
      data: response.ok ? data : null,
      message: response.ok ? null : data,
    };
  } else {
    const text = await response.text();
    return {
      success: response.ok,
      data: response.ok ? text : null,
      message: response.ok ? null : text,
    };
  }
};

export const apiFetch = async (method, url, token, data = null) => {
  requireAuthToken(token);
  try {
    const options = {
      method,
      headers: buildHeaders(token, data ? "application/json" : undefined),
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    const result = await handleResponse(response);

    if (!result.success) {
      console.error(`${method} failed:`, result.message);
    } else {
      console.log(`${method} success:`, result.data);
    }

    return result;
  } catch (error) {
    console.error(`${method} error:`, error);
    return {
      success: false,
      message: error.message || error.toString(),
    };
  }
};

export const handleJsonResponse = async (response, successMessage) => {
  const contentType = response.headers.get("Content-Type");
  let result;

  if (contentType && contentType.includes("application/json")) {
    result = await response.json();
  } else {
    result = await response.text();
  }

  if (response.ok) {
    return {
      success: true,
      message: successMessage,
      data: result,
    };
  } else {
    console.error("Request failed:", result);
    return {
      success: false,
      message: result,
    };
  }
};

export const postJson = async (url, data) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error("Network error:", error);
    return {
      success: false,
      message: error.message || error.toString(),
    };
  }
};

