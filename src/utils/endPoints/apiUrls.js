import config from "../config/config";
const path = (route) => `${config.BaseURL}${route}`;
  console.log("path",path)

export const Urls = {
  userLogin: path("/users/login"),
  
};
