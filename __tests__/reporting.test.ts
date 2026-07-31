import { getSupabaseClient } from "../src/lib/supabase";
import { submitReport, validateReportInput } from "../src/services/reporting";

jest.mock("../src/lib/supabase", () => ({
  getSupabaseClient: jest.fn()
}));

describe("reporting", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("requires a report reason", () => {
    expect(validateReportInput({ reason: "", details: "" })).toEqual(["请选择举报原因"]);
  });

  it("limits report details length", () => {
    expect(validateReportInput({ reason: "疑似假货", details: "a".repeat(501) })).toEqual([
      "补充说明不能超过 500 字"
    ]);
  });

  it("accepts a valid report", () => {
    expect(validateReportInput({ reason: "疑似假货", details: "价格和来源描述异常" })).toEqual([]);
  });

  it("creates an open report row", async () => {
    const insert = jest.fn().mockResolvedValue({ error: null });
    const from = jest.fn(() => ({ insert }));
    jest.mocked(getSupabaseClient).mockReturnValue({ from } as never);

    await submitReport({
      reporterId: "user-1",
      targetType: "listing",
      targetId: "listing-1",
      reason: "疑似假货",
      details: "价格和来源描述异常"
    });

    expect(from).toHaveBeenCalledWith("reports");
    expect(insert).toHaveBeenCalledWith({
      reporter_id: "user-1",
      target_type: "listing",
      target_id: "listing-1",
      reason: "疑似假货",
      details: "价格和来源描述异常",
      status: "open"
    });
  });
});
