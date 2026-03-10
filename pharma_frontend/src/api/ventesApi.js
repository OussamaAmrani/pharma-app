import api from "./axiosConfig";

export const createVente = (data) => {
  return api.post("ventes/", data);
};

export const getVentes = () => {
  return api.get("ventes/");
};