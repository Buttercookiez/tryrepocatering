// src/api/api.js
import axios from 'axios';

// 1. Define your BACKEND URL here.
// IMPORTANT: Do NOT put a slash '/' at the very end.
const BASE_URL = 'https://tryrepocatering.vercel.app/api'; 

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Needed for cookies/sessions if you use them
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;