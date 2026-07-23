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
});
