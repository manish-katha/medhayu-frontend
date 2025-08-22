// src/utils/config/config.js

const config = {
  Environment: process.env.NEXT_PUBLIC_ENVIRONMENT,
  BaseURL: process.env.NEXT_PUBLIC_API_URL,
};

console.log("consfi",config)
export default config;
