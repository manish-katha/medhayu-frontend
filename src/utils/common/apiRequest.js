
import { toast } from "@/hooks/use-toast";  

import { getCredentials } from "./authHelper";
import { triggerTokenExpire } from "../helper/tokenHelper";


function getRequestHeaders(type) {
  let headers = {};
  switch (type) {
    case "json":
      headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
      };
      break;
    case "form":
      headers = {
        accept: "application/json",
        "access-control-allow-origin": "*",
      };
      break;
    default:
      headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      };
      break;
  }
  return headers;
}

function createQueryOrParams(object, type = "query") {
  let string = "";
  let length = Object.entries(object).length || 0;
  if (type === "query") {
    string = "?";
    Object.entries(object).forEach((item, index) => {
      string = string + item[0] + "=" + item[1];
      if (length !== index + 1) {
        string = string + "&";
      }
    });
  } else if (type === "params") {
    string = "/";
    Object.entries(object).forEach((item, index) => {
      string = string + item[1];
      if (length !== index + 1) {
        string = string + "/";
      }
    });
  }
  return string;
}

const apiRequest = async ({
  endUrl,
  method,
  headerType = "json",
  body = null,
  query = null,
  params = null,
  token = true,
  savedToken = null,
  showMsg = false,
}) => {
  let requestHeaders = getRequestHeaders(headerType);
  if (headerType === "file") {
    requestHeaders["Content-Type"] = "multipart/form-data;";
    requestHeaders["Accept"] = "*/*;";
  }
  if (savedToken) {
    requestHeaders.Authorization = "Bearer " + savedToken;
  } else if (token) {
    /* Add token */
    requestHeaders.Authorization = "Bearer " + getCredentials();
  }
  if (params) {
    /* Add params */
    endUrl = endUrl + createQueryOrParams(params, "params");
  }

  /* Add query */
  if (query && typeof query === "object") {
    const queryParams = Object.entries(query)
      .filter(
        ([, value]) => value !== undefined && value !== null && value !== ""
      )
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${encodeURIComponent(key)}=${encodeURIComponent(
            value.join(",")
          )}`;
        } else if (value instanceof Date) {
          return `${encodeURIComponent(key)}=${encodeURIComponent(
            value.toString()
          )}`;
        } else if (typeof value === "object") {
          console.warn(`Skipping unsupported object in query: ${key}`);
          return null;
        }
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      })
      .filter(Boolean)
      .join("&");

    if (queryParams) {
      endUrl += (endUrl.includes("?") ? "&" : "?") + queryParams;
    }
  }
  const options = {
    method: method,
    headers: requestHeaders,
    timeoutInterval: 10000,
  };
  if (body) {
    options.body = headerType === "json" ? JSON.stringify(body) : body;
  }
  try {
    let fetched = await fetch(endUrl, options);

    let response = await fetched.json();

    if (fetched.status === 498 || response?.status_code === 498) {
      // if you have refresh-token logic, try that here first; otherwise:
      triggerTokenExpire();
      return { status: false, response };
    }

    if (
      fetched.status === 200 ||
      fetched.status_code === 200 ||
      fetched.status === 201
    ) {
      /* Will modify according to api's response */
      response = {
        status: true,
        response,
      };
    } else {
      response = { status: false, response };
    }
    if (showMsg) {
      if(response.status){
      toast({ title: "Success!", description: response?.response.message });

      }else{
      toast({ variant: 'destructive', description: response?.response.message });
      }
        
    }
    return response;
  } catch (e) {
    if (showMsg) {
      toast({ variant: 'destructive', description: e.toString() });
    }
    return { status: false, data: {}, message: e.toString() };
  }
};


export { apiRequest, createQueryOrParams };
