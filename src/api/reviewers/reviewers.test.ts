import { describe, expect, it, beforeEach, vi } from "vitest";
import type { Mock } from "vitest";
import axios from "axios";
import { call } from "../http";
import { fetchReviewers } from "./reviewers";
import type { Person } from "../types";

describe("fetchReviewers", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns data on success", async () => {
    const sample: Person[] = [
      {
        id: "1",
        firstName: "A",
        lastName: "B",
        email: "a@b.com",
        catchPhrase: "hello",
        comments: "world",
      },
    ];

    vi.mocked(call).mockResolvedValue({ data: sample } as { data: Person[] });

    const result = await fetchReviewers({ _start: 5, _limit: 5 });

    expect(result).toEqual({ data: sample, error: null });
    expect(call).toHaveBeenCalledWith("/reviewers", { _start: 5, _limit: 5 });
  });

  it("returns mapped axios error", async () => {
    const axiosError = {
      message: "Request failed",
      code: "ERR_BAD_RESPONSE",
      response: { status: 400, data: { message: "bad" } },
    };

    const mockIsAxiosError = axios.isAxiosError as unknown as Mock;
    mockIsAxiosError.mockReturnValue(true);
    vi.mocked(call).mockRejectedValue(axiosError);

    const result = await fetchReviewers();

    expect(result).toEqual({
      data: null,
      error: {
        status: 400,
        message: "Request failed",
        code: "ERR_BAD_RESPONSE",
        data: { message: "bad" },
      },
    });
  });

  it("returns unexpected error for non-axios errors", async () => {
    const mockIsAxiosError = axios.isAxiosError as unknown as Mock;
    mockIsAxiosError.mockReturnValue(false);
    vi.mocked(call).mockRejectedValue(new Error("boom"));

    const result = await fetchReviewers();

    expect(result).toEqual({
      data: null,
      error: { message: "Unexpected error" },
    });
  });
});
