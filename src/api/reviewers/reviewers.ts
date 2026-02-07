import axios from "axios";
import { call } from "../http";
import type { ApiError, ApiResult, ListParams, Person } from "../types";
import { fail, ok } from "../types";

export async function fetchReviewers(
  params?: ListParams
): Promise<ApiResult<Person[]>> {
  try {
    const response = await call<Person[]>("/reviewers", params);
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

    return fail({
      message: "Unexpected error",
    });
  }
}
