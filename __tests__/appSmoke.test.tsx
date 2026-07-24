import { fireEvent, render, screen } from "@testing-library/react-native";
import App from "../App";

function renderEnteredApp() {
  render(<App />);

  fireEvent.press(screen.getByLabelText("进入演示模式"));
  fireEvent.press(screen.getByText("我已阅读并同意《用户协议》"));
  fireEvent.press(screen.getByText("我已阅读并同意《隐私政策》"));
  fireEvent.press(screen.getByText("同意并继续"));
}

describe("App", () => {
  it("shows auth and consent before entering the marketplace", () => {
    render(<App />);

    expect(screen.getByText("登录 VeloHive")).toBeTruthy();
    expect(screen.queryByText("Specialized Tarmac SL7 整车 52 码")).toBeNull();

    fireEvent.press(screen.getByLabelText("进入演示模式"));
    expect(screen.getByText("开始前确认")).toBeTruthy();

    fireEvent.press(screen.getByText("同意并继续"));
    expect(screen.getByText("请先阅读并勾选用户协议和隐私政策")).toBeTruthy();
  });

  it("renders marketplace listings on the Gear tab", () => {
    renderEnteredApp();

    expect(screen.getByText("VeloHive")).toBeTruthy();
    expect(screen.getByText("Specialized Tarmac SL7 整车 52 码")).toBeTruthy();
    expect(screen.getByText("Shimano Ultegra R8170 套件")).toBeTruthy();
  });

  it("narrows Gear tab results with search and inspection filter", () => {
    renderEnteredApp();

    fireEvent.changeText(screen.getByLabelText("搜索装备"), "garmin");

    expect(screen.getByText("Garmin Edge 840 码表")).toBeTruthy();
    expect(screen.queryByText("Specialized Tarmac SL7 整车 52 码")).toBeNull();

    fireEvent.press(screen.getByText("只看可验货"));

    expect(screen.queryByText("Garmin Edge 840 码表")).toBeNull();
    expect(screen.getByText("找到 0 件装备")).toBeTruthy();
  });

  it("opens listing detail from Gear results", () => {
    renderEnteredApp();

    fireEvent.press(screen.getByLabelText("查看商品 Specialized Tarmac SL7 整车 52 码"));

    expect(screen.getByText("商品详情")).toBeTruthy();
    expect(screen.getByText("右侧手变有轻微擦痕，已拍照标注。")).toBeTruthy();
  });

  it("switches from Gear to Hubs", () => {
    renderEnteredApp();

    fireEvent.press(screen.getByText("找据点"));

    expect(screen.getByText("青浦湖畔咖啡")).toBeTruthy();
    expect(screen.getByText("松江骑行驿站")).toBeTruthy();
  });

  it("opens hub detail from Hubs results", () => {
    renderEnteredApp();

    fireEvent.press(screen.getByText("找据点"));
    fireEvent.press(screen.getByLabelText("查看据点 青浦湖畔咖啡"));

    expect(screen.getByText("据点详情")).toBeTruthy();
    expect(screen.getByText("09:00-20:00")).toBeTruthy();
  });

  it("opens Publish, Messages, and Profile tabs", async () => {
    renderEnteredApp();

    fireEvent.press(screen.getByText("发布"));
    expect(screen.getByText("发布闲置装备")).toBeTruthy();
    expect(screen.getByDisplayValue("32800")).toBeTruthy();
    expect(screen.queryByText("价格必须大于 0")).toBeNull();

    fireEvent.press(screen.getByText("预览发布"));
    expect(screen.getByText("发布预览")).toBeTruthy();
    expect(screen.getByText("Specialized Tarmac SL7 整车")).toBeTruthy();
    fireEvent.press(screen.getByText("提交审核"));
    expect(await screen.findByText("已提交审核")).toBeTruthy();

    fireEvent.press(screen.getByText("消息"));
    expect(screen.getByText("周六下午青浦湖畔咖啡看车可以。")).toBeTruthy();

    fireEvent.press(screen.getByText("我的"));
    expect(screen.getByText("阿泽")).toBeTruthy();
  });
});
