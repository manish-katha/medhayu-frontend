"use client"

import { apiRequest } from "../utils/common/apiRequest";
import { Urls } from "../utils/endPoints/apiUrls";


export const createPatient = async (patientData) => {
  console.log("Urls.createPatient:", Urls.createPatient);
  try {
    const response = await apiRequest({
      endUrl: Urls.createPatient,  
      method: "POST",
      body: { ...patientData },
      token: true,
      showMsg: true,
    });

    console.log("Create Patient response:", response);

    if (response.status === true) {
      return {
        success: true,
        data: response?.response?.data, 
      };
    } else {
      throw new Error(response?.response?.message || "Failed to create patient");
    }
  } catch (error) {
    console.error("Error in createPatient:", error);
    return { success: false, error: error.message };
  }
};

// export const getPatients = async (query = {}) => {
//   try {
//     const response = await apiRequest({
//       endUrl: Urls.getPatients,
//       method: "GET",
//       token: true,
//       query,
//       showMsg: false,
//     });

//     if (response.status === true) {
//       return { success: true, data: response?.response?.data };
//     } else {
//       throw new Error(response?.response?.message || "Failed to fetch patients");
//     }
//   } catch (error) {
//     console.error("Error in getPatients:", error);
//     return { success: false, error: error.message };
//   }
// };

export const getPatients = async (
  page = 1,
  limit = 10,
  filters = {}
) => {
  try {
    const response = await apiRequest({
      endUrl: Urls.getPatients,
      method: "GET",
      token: true,
      query: {
        page,
        limit,
        ...filters, // gender, age, etc.
      },
      showMsg: false,
    });

    if (response.status === true) {
      return {
        success: true,
        data: response?.response?.data,
      };
    } else {
      throw new Error(response?.response?.message || "Failed to fetch patients");
    }
  } catch (error) {
    console.error("Error in getPatients:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get patient details by ID
 */
export const getPatient = async (patientId) => {
  try {
    const response = await apiRequest({
      endUrl: Urls.getPatient + `/${patientId}`,
      method: "GET",
      token: true,
      showMsg: false,
    });

    if (response.status === true) {
      return { success: true, data: response?.response?.data };
    } else {
      throw new Error(response?.response?.message || "Failed to fetch patient");
    }
  } catch (error) {
    console.error("Error in getPatient:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Update patient details
 */
export const updatePatient = async (patientId, updatedData) => {
  try {
    const response = await apiRequest({
      endUrl: Urls.updatePatient + `/${patientId}`,
      method: "PUT",
      body: { ...updatedData },
      headerType: "json",
      token: true,
      showMsg: true,
    });

    if (response.status === true) {
      return { success: true, data: response?.response?.data };
    } else {
      throw new Error(response?.response?.message || "Failed to update patient");
    }
  } catch (error) {
    console.error("Error in updatePatient:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete a patient by ID
 */
export const deletePatient = async (patientId) => {
  try {
    const response = await apiRequest({
      endUrl: Urls.deletePatient + `/${patientId}`,
      method: "DELETE",
      token: true,
      showMsg: true,
    });

    if (response.status === true) {
      return { success: true, data: response?.response?.data };
    } else {
      throw new Error(response?.response?.message || "Failed to delete patient");
    }
  } catch (error) {
    console.error("Error in deletePatient:", error);
    return { success: false, error: error.message };
  }
};
