import { fireEvent, render, screen } from "@testing-library/react-native";
import App from "../App";

describe("App", () => {
  it("renders the VeloHive shell", () => {
    render(<App />);

    expect(screen.getByText("VeloHive")).toBeTruthy();
    expect(screen.getByText("淘装备")).toBeTruthy();
    expect(screen.getByText("找据点")).toBeTruthy();
    expect(screen.getByText("发布")).toBeTruthy();
    expect(screen.getByText("消息")).toBeTruthy();
    expect(screen.getByText("我的")).toBeTruthy();

    expect(screen.getByRole("button", { name: "淘装备" })).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "找据点" }));
    expect(screen.getByText("骑友友好据点")).toBeTruthy();
  });
});
