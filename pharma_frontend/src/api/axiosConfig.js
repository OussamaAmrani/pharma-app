// C:\Users\PC\Desktop\pharma_frontend\src\api\axiosConfig.js
import axios from "axios";

const api = axios.create({
  baseURL: "/api",  // PLUS D'URL COMPLÈTE !
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 10000
});

// Log pour vérifier
api.interceptors.request.use(request => {
  console.log('🚀 Requête vers:', request.url);
  return request;
});

export default api;