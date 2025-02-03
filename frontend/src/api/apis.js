export const postApi = async (token, data, url) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Success:", data);
      return {
        success: true,
        data: data,
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

      console.error("Failed post:", errorBody);
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

export const getApi = async (token, url) => {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const contentType = response.headers.get("Content-Type");
      let errorBody;

      if (contentType && contentType.includes("application/json")) {
        errorBody = await response.json();
      } else if (contentType && contentType.includes("text/plain")) {
        errorBody = await response.text();
      } else {
        errorBody = await response.text();
      }

      console.error("Failed get:", errorBody);
      return {
        success: false,
        message: errorBody,
      };
    }

    const json = await response.json();
    return {
      success: true,
      data: json,
    };
  } catch (error) {
    console.error("Get error:", error);
    return {
      success: false,
      message: error.message || error.toString(),
    };
  }
};

export const deleteApi = async (token, url) => {
  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error("Failed to delete:", response.status, response.statusText);
      return {
        success: true,
        message: response.statusText,
      };
    }

    console.log("Object deleted successfully");
  } catch (error) {
    return {
      success: false,
      message: error.message || error.toString(),
    };
  }
};

export const putApi = async (token, data, url) => {
  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const responseData = await response.json();
      console.log("Success:", responseData);
      return {
        success: true,
        data: responseData,
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

      console.error("Failed PUT:", errorBody);
      return {
        success: false,
        message: errorBody,
      };
    }
  } catch (error) {
    console.error("PUT Error:", error);
    return {
      success: false,
      message: error.message || error.toString(),
    };
  }
};
