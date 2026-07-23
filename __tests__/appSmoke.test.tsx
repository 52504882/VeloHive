import { fireEvent, render, screen } from "@testing-library/react-native";
import App from "../App";

describe("App", () => {
  it("renders marketplace listings on the Gear tab", () => {
    render(<App />);

    expect(screen.getByText("VeloHive")).toBeTruthy();
    expect(screen.getByText("Specialized Tarmac SL7 整车 52 码")).toBeTruthy();
    expect(screen.getByText("Shimano Ultegra R8170 套件")).toBeTruthy();
  });

  it("switches from Gear to Hubs", () => {
    render(<App />);

    fireEvent.press(screen.getByText("找据点"));

    expect(screen.getByText("青浦湖畔咖啡")).toBeTruthy();
    expect(screen.getByText("松江骑行驿站")).toBeTruthy();
  });

  it("opens Publish, Messages, and Profile tabs", () => {
    render(<App />);

    fireEvent.press(screen.getByText("发布"));
    expect(screen.getByText("发布闲置装备")).toBeTruthy();

    fireEvent.press(screen.getByText("消息"));
    expect(screen.getByText("周六下午青浦湖畔咖啡看车可以。")).toBeTruthy();

    fireEvent.press(screen.getByText("我的"));
    expect(screen.getByText("阿泽")).toBeTruthy();
  });
});
