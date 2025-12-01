import axios from "axios";

// 1. Get the base URL from the Environment Variable (set in Vercel/local .env)
// We provide a fallback to http://localhost:5000 for safety.
const BASE_URL = process.env.REACT_APP_API_BASE || "http://localhost:5000";

const api = axios.create({
  // 2. Use the variable for the base URL
  baseURL: BASE_URL + "/api",
  // Ensure cookies/credentials are sent for session/auth checks
  withCredentials: true 
});

export default api;