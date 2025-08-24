"use client"

import { apiRequest } from "../utils/common/apiRequest";
import { Urls } from "../utils/endPoints/apiUrls";

export const getClinicsForUser = async (extraQuery = {}) => {
  try {
    // Get user_detail from localStorage
   
    const response = await apiRequest({
      endUrl: Urls.getClinics, // e.g. "/api/clinics"
      method: "GET",
      token: true,
      showMsg: false,
    });

    if (response.status === true) {
      return {
        success: true,
        data: response?.response?.data,
      };
    } else {
      throw new Error(response?.response?.message || "Failed to fetch clinics");
    }
  } catch (error) {
    console.error("Error in getClinics:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
