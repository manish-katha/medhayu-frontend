import axios from "axios";

const axiosInstance = axios.create();

axiosInstance.interceptors.response.use(success, error);

function success(response) {
  const { data } = response || {};
  if (data && Array.isArray(data.errors) && data.errors.length > 0) {
    const rejectData = {
      message: data.errors?.[0]?.message || "Unable to connect to network",
      data: data?.data,
    };
    return Promise.reject(rejectData);
  }
  // return response.data || {};
  return {
    status: true,
    data: response.data.data,
    message: response.data.message,
  };
}

function error(error) {
  const rejectData = {
    status: false,
    data: error?.response?.data?.data,
    message:
      error?.response?.data?.errors?.[0]?.message ||
      "Unable to connect to network",
  };
  return Promise.reject(rejectData);
}

export default axiosInstance;
