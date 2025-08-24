'use client';

import { apiRequest } from "../utils/common/apiRequest";
import { Urls } from "../utils/endPoints/apiUrls";

export const login = async (email, password) => {
  console.log("Urls.userLogin,",Urls.userLogin)
  try {
    const response = await apiRequest({
      endUrl: Urls.userLogin,
      method: "POST",
      body: { email, password },
      showMsg: true,
    });
    console.log("response",response);

    if (response.status === true) {
      return {
        success: true,
        token: response?.response?.data?.token,
        data: response?.response?.data?.user,
      };
    } else {
      throw new Error(response?.response?.message || "Failed to login");
    }
  } catch (error) {
    console.error("Error in login:", error);
    return { success: false, error: error.message };
  }
};

export const registerUser = async (formData) => {
  try {

    const response = await apiRequest({
      endUrl: Urls.userRegister, // Make sure you have this URL in apiUrls
      method: "POST",
      body: {...formData},
      showMsg: true,
    });

    console.log("Register response:", response);

    if (response.status === true) {
      return {
        success: true,
        token: response?.response?.data?.token, // if your backend sends token
        data: response?.response?.data?.user,
      };
    } else {
      throw new Error(response?.response?.message || "Failed to register");
    }
  } catch (error) {
    console.error("Error in register:", error);
    return { success: false, error: error.message };
  }
};

