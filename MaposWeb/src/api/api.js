import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

const API_BASE = 'http://localhost:5000/api/kitchen';
export default api;
    