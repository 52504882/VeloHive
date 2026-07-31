# VeloHive

VeloHive 是一个面向上海周边骑友的公路车闲置交易与据点平台。

第一版产品方向：

- 公路车整车和配件闲置交易。
- 商品发布、浏览、搜索、收藏和私聊撮合。
- 咖啡吧、农家乐、车店、骑行驿站等本地据点。
- 支持买卖双方约在据点线下验货。
- 第一版不做平台担保支付，先验证供给、需求和信任机制。

## 开发命令

```bash
npm install
npm start
npm test
npm run typecheck
npm run admin:dev
npm run admin:test
npm run admin:build
npx eas build:inspect --platform ios --profile preview
npx eas build:inspect --platform android --profile preview
```

## Beta 构建

`eas.json` 已提供 `development`、`preview` 和 `production` profiles。Apple/Google 凭证准备好后，可使用：

```bash
npx eas login
npx eas build:inspect --platform ios --profile preview --stage archive --output /tmp/velohive-eas-ios --force
npx eas build:inspect --platform android --profile preview --stage archive --output /tmp/velohive-eas-android --force
npx eas build -p ios --profile preview
npx eas build -p android --profile preview
```

## 文档

- [产品设计文档](docs/superpowers/specs/2026-07-23-road-bike-marketplace-design.md)
- [移动端 MVP 实施计划](docs/superpowers/plans/2026-07-23-velohive-mobile-mvp.md)
- [隐私政策草案](docs/legal/privacy-policy.zh-CN.md)
- [用户协议草案](docs/legal/terms-of-service.zh-CN.md)
- [禁售品规则](docs/legal/prohibited-items.zh-CN.md)
- [应用商店检查清单](docs/release/app-store-checklist.md)
