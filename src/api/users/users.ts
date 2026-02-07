import axios from "axios";
import { call } from "../http";
import type { ApiError, ApiResult, ListParams, Person } from "../types";
import { fail, ok } from "../types";

export async function fetchUsers(params?: ListParams): Promise<ApiResult<Person[]>> {
  try {
    const response = await call<Person[]>("/users", params);
    return ok<Person[]>(response.data);
  } catch (err) {
    const error = err as unknown;
    if (axios.isAxiosError(error)) {
      const apiError: ApiError = {
        status: error.response?.status,
        message: error.message,
        code: error.code,
        data: error.response?.data,
      };
      return fail(apiError);
    }

    return null;
    // return fail({
    //   message: "Unexpected error",
    // });
  }
}
