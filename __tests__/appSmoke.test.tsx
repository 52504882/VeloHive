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

  it("reports a listing and blocks the seller from listing detail", async () => {
    renderEnteredApp();

    fireEvent.press(screen.getByLabelText("查看商品 Specialized Tarmac SL7 整车 52 码"));
    fireEvent.press(screen.getByText("举报商品"));
    fireEvent.press(screen.getByText("疑似假货"));
    fireEvent.changeText(screen.getByLabelText("举报补充说明"), "价格和来源描述异常");
    fireEvent.press(screen.getByText("提交举报"));

    expect(await screen.findByText("举报已提交，平台会尽快处理。")).toBeTruthy();

    fireEvent.press(screen.getByText("拉黑卖家"));
    expect(await screen.findByText("已拉黑卖家")).toBeTruthy();
  });

  it("starts a private conversation from listing detail and sends a message", async () => {
    renderEnteredApp();

    fireEvent.press(screen.getByLabelText("查看商品 Specialized Tarmac SL7 整车 52 码"));
    fireEvent.press(screen.getByText("私聊卖家"));

    expect(await screen.findByText("私聊")).toBeTruthy();
    fireEvent.changeText(screen.getByLabelText("输入消息"), "周末可以看车吗？");
    fireEvent.press(screen.getByText("发送"));

    expect(await screen.findByText("周末可以看车吗？")).toBeTruthy();
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

  it("blocks a user from the Messages tab", async () => {
    renderEnteredApp();

    fireEvent.press(screen.getByText("消息"));
    fireEvent.press(screen.getByText("拉黑用户"));

    expect(await screen.findByText("已拉黑用户")).toBeTruthy();
  });

  it("opens an existing private conversation from the Messages tab", () => {
    renderEnteredApp();

    fireEvent.press(screen.getByText("消息"));
    fireEvent.press(screen.getByText("打开会话"));

    expect(screen.getByText("私聊")).toBeTruthy();
    expect(screen.getByText("周六下午青浦湖畔咖啡看车可以。")).toBeTruthy();
  });

  it("shows prohibited rule feedback on the Publish tab", async () => {
    renderEnteredApp();

    fireEvent.press(screen.getByText("发布"));
    fireEvent.changeText(screen.getByLabelText("标题"), "假货车架");
    expect(screen.getByText("禁止发布假货或仿品")).toBeTruthy();
    fireEvent.press(screen.getByText("提交审核"));
    expect(screen.queryByText("已提交审核")).toBeNull();
    expect(screen.getByText("请先修正发布检查中的问题")).toBeTruthy();

    fireEvent.changeText(screen.getByLabelText("标题"), "碳纤维轮组");
    fireEvent.changeText(screen.getByLabelText("瑕疵说明"), "来源来路不明，需要买家自行判断");
    expect(screen.getByText("需人工复核来源，将进入人工审核")).toBeTruthy();

    fireEvent.press(screen.getByText("预览发布"));
    expect(screen.getByText("发布预览")).toBeTruthy();
    fireEvent.press(screen.getByText("提交审核"));
    expect(await screen.findByText("已提交审核")).toBeTruthy();
  });
});
