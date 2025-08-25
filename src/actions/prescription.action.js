"use client";

import { apiRequest } from "../utils/common/apiRequest";
import { Urls } from "../utils/endPoints/apiUrls";

/**
 * Create a new prescription
 */
export const createPrescription = async (prescriptionData) => {
  console.log("Urls.createPrescription:", Urls.createPrescription);
  try {
    const response = await apiRequest({
      endUrl: Urls.createPrescription,
      method: "POST",
      body: { ...prescriptionData },
      token: true,
      showMsg: true,
    });

    console.log("Create Prescription response:", response);

    if (response.status === true) {
      return {
        success: true,
        data: response?.response?.data,
      };
    } else {
      throw new Error(response?.response?.message || "Failed to create prescription");
    }
  } catch (error) {
    console.error("Error in createPrescription:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get list of prescriptions with optional filters
 */
export const getPrescriptions = async (page = 1, limit = 10, filters = {}) => {
  try {
    const response = await apiRequest({
      endUrl: Urls.getPrescriptions,
      method: "GET",
      token: true,
      query: {
        page,
        limit,
        ...filters, // patientId, date range, etc.
      },
      showMsg: false,
    });

    if (response.status === true) {
      return { success: true, data: response?.response?.data };
    } else {
      throw new Error(response?.response?.message || "Failed to fetch prescriptions");
    }
  } catch (error) {
    console.error("Error in getPrescriptions:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get a prescription by ID
 */
export const getPrescription = async (prescriptionId) => {
  try {
    const response = await apiRequest({
      endUrl: Urls.getPrescription + `/${prescriptionId}`,
      method: "GET",
      token: true,
      showMsg: false,
    });

    if (response.status === true) {
      return { success: true, data: response?.response?.data };
    } else {
      throw new Error(response?.response?.message || "Failed to fetch prescription");
    }
  } catch (error) {
    console.error("Error in getPrescription:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Update a prescription by ID
 */
export const updatePrescription = async (prescriptionId, updatedData) => {
  try {
    const response = await apiRequest({
      endUrl: Urls.updatePrescription + `/${prescriptionId}`,
      method: "PUT",
      body: { ...updatedData },
      headerType: "json",
      token: true,
      showMsg: true,
    });

    if (response.status === true) {
      return { success: true, data: response?.response?.data };
    } else {
      throw new Error(response?.response?.message || "Failed to update prescription");
    }
  } catch (error) {
    console.error("Error in updatePrescription:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete a prescription by ID
 */
export const deletePrescription = async (prescriptionId) => {
  try {
    const response = await apiRequest({
      endUrl: Urls.deletePrescription + `/${prescriptionId}`,
      method: "DELETE",
      token: true,
      showMsg: true,
    });

    if (response.status === true) {
      return { success: true, data: response?.response?.data };
    } else {
      throw new Error(response?.response?.message || "Failed to delete prescription");
    }
  } catch (error) {
    console.error("Error in deletePrescription:", error);
    return { success: false, error: error.message };
  }
};
