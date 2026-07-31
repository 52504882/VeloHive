# VeloHive App Store / Google Play 上架检查清单

## Apple

- [ ] Apple Developer Program 账号已开通。
- [ ] App Store Connect 创建应用记录。
- [ ] Bundle ID：`com.velohive.app`。
- [ ] 隐私政策 URL 可公开访问。
- [ ] 支持 URL 可公开访问。
- [ ] App 隐私营养标签完成，覆盖账号、商品图片、聊天、举报、据点数据。
- [ ] TestFlight 构建上传并可安装。
- [ ] 提供审核测试账号和操作说明。
- [ ] 截图覆盖：首页、商品详情、发布、私聊、据点、我的。
- [ ] 图标和启动体验检查完成。

## Google Play

- [ ] Google Play Developer 账号已开通。
- [ ] 创建应用记录。
- [ ] Application ID：`com.velohive.app`。
- [ ] Closed testing 或 internal testing 构建可安装。
- [ ] Data safety form 完成。
- [ ] 隐私政策 URL、支持 URL、客服邮箱填写完成。
- [ ] 内容分级问卷完成。
- [ ] 截图、图标、功能图准备完成。

## 通用发布准备

- [ ] 禁售品规则、用户协议、隐私政策已经法务复核。
- [ ] 举报、拉黑、下架、账号限制流程可用。
- [ ] 后台审核账号已配置 `app_metadata.role = admin` 或 `moderator`。
- [ ] 生产 Supabase RLS、Storage bucket、RPC 权限验证完成。
- [ ] 生产环境变量配置完成。
- [ ] 备份、日志和客服处理流程明确。
- [ ] 中国大陆 APP 备案适用性已评估；如需备案，先完成主体、域名、服务内容和接入信息审核。

