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
        data: response.response.data,
      };
    } else {
      throw new Error(response.response.message || "Failed to login");
    }
  } catch (error) {
    console.error("Error in login:", error);
    return { success: false, error: error.message };
  }
};
