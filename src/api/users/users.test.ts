import { describe, expect, it, beforeEach, vi } from "vitest";
import type { Mock } from "vitest";
import axios from "axios";
import { call } from "../http";
import { fetchUsers } from "./users";
import type { Person } from "../types";

describe("fetchUsers", () => {
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

    const result = await fetchUsers({ _page: 1, _limit: 10 });

    expect(result).toEqual({ data: sample, error: null });
    expect(call).toHaveBeenCalledWith("/users", { _page: 1, _limit: 10 });
  });

  it("returns mapped axios error", async () => {
    const axiosError = {
      message: "Request failed",
      code: "ERR_BAD_RESPONSE",
      response: { status: 500, data: { message: "fail" } },
    };

    const mockIsAxiosError = axios.isAxiosError as unknown as Mock;
    mockIsAxiosError.mockReturnValue(true);
    vi.mocked(call).mockRejectedValue(axiosError);

    const result = await fetchUsers();

    expect(result).toEqual({
      data: null,
      error: {
        status: 500,
        message: "Request failed",
        code: "ERR_BAD_RESPONSE",
        data: { message: "fail" },
      },
    });
  });

  it("returns unexpected error for non-axios errors", async () => {
    const mockIsAxiosError = axios.isAxiosError as unknown as Mock;
    mockIsAxiosError.mockReturnValue(false);
    vi.mocked(call).mockRejectedValue(new Error("boom"));

    const result = await fetchUsers();

    expect(result).toEqual({
      data: null,
      error: { message: "Unexpected error" },
    });
  });
});
