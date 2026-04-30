import http from "./http";

export const signup = (payload) => http.post("/auth/signup", payload).then((res) => res.data);

export const login = (payload) => http.post("/auth/login", payload).then((res) => res.data);

export const getMe = () => http.get("/auth/me").then((res) => res.data);
