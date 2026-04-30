import http from "./http";

const normalizeParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value !== undefined && value !== null)
  );

export const getPracticeQuestions = (params) =>
  http.get("/practice/questions", { params: normalizeParams(params) }).then((res) => res.data);

export const getRevisionQuestions = (params) =>
  http.get("/revision/questions", { params: normalizeParams(params) }).then((res) => res.data);

export const submitAttempt = (payload) => http.post("/attempts", payload).then((res) => res.data);

export const getProgressSummary = () => http.get("/progress/summary").then((res) => res.data);
