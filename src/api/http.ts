import axios from "axios";

export const http = axios.create({
  baseURL: "http://localhost:3001",
  timeout: 10000,
});

export async function call<T>(endpoint: string, params?: Record<string, unknown>) {
  return http.get<T>(endpoint, { params });
}
