import http from "./http";

const normalizeParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value !== undefined && value !== null)
  );

export const listResource = (resource, params) =>
  http.get(`/${resource}`, { params: normalizeParams(params) }).then((res) => res.data);

export const getResource = (resource, id) => http.get(`/${resource}/${id}`).then((res) => res.data);

export const createResource = (resource, payload) =>
  http.post(`/${resource}`, payload).then((res) => res.data);

export const updateResource = (resource, id, payload) =>
  http.patch(`/${resource}/${id}`, payload).then((res) => res.data);

export const deleteResource = (resource, id) =>
  http.delete(`/${resource}/${id}`).then((res) => res.data);
