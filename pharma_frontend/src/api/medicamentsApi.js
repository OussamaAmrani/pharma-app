// C:\Users\PC\Desktop\pharma_frontend\src\api\medicamentsApi.js
import api from './axiosConfig';

export const getMedicaments = () => {
  return api.get('/medicaments/');
};

export const createMedicament = (data) => {
  return api.post('/medicaments/', data);
};

export const updateMedicament = (id, data) => {
  return api.put(`/medicaments/${id}/`, data);
};

export const deleteMedicament = (id) => {
  return api.delete(`/medicaments/${id}/`);
};