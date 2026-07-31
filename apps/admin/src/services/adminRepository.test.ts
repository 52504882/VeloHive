import { describe, expect, it } from "vitest";
import { nextReviewStatus } from "./adminRepository";

describe("admin repository helpers", () => {
  it("maps approve actions to active status", () => {
    expect(nextReviewStatus("approve")).toBe("active");
  });

  it("maps reject actions to removed status", () => {
    expect(nextReviewStatus("reject")).toBe("removed");
  });
});
