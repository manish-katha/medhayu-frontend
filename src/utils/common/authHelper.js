
import axiosInstance from "./axios";
import config from "../config/config";

/* Alias auth variable */
const authAlias = "__SK&*TY";



const getCredentials = () => {
  try {
    return localStorage.getItem(authAlias); //JSON.parse(decrypt(localStorage.getItem(authAlias)))
  } catch (err) {
    return err;
  }
};

const setSession = (data) => {
  if (data) {
    localStorage.setItem(authAlias, data);
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${data}`;
  } else {
    localStorage.removeItem(authAlias);
    delete axiosInstance.defaults.headers.common.Authorization;
  }
};

/* Single Sign On Token */
const getSSOToken = () => {
  const url = new URLSearchParams(window.location.search);
  const sso_token = url.get("sso_token");
  if (sso_token) return sso_token;
  const allCookies = document.cookie.split(";");
  for (let i = 0; i < allCookies.length; i += 1) {
    if (allCookies[i].split("=")[0].trim() === "sso_token") {
      return allCookies[i].split("=")[1];
    }
  }
};

const logout = () => {
  localStorage.clear();
};

export {
  logout,
  setSession,
  getSSOToken,
  getCredentials,
  encrypt as encryptData,
  decrypt as decryptData,
  authAlias,
};
