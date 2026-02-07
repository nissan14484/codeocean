import { vi } from "vitest";

vi.mock("./src/api/http", () => ({
  call: vi.fn(),
}));

vi.mock("axios", () => {
  const isAxiosError = vi.fn();
  return { default: { isAxiosError }, isAxiosError };
});
