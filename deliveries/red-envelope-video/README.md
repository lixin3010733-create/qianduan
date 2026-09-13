# 视频还原：红包发送流程 H5

来源：用户提供的 71.34 秒、1290 × 2796 手机录屏。

## 已还原流程

1. 红包心意首页
2. 选择红包封面
3. 输入红包个数
4. 输入单个红包金额
5. 数字键盘输入与删除
6. 币种选择底部弹层
7. SOL / USDC 等币种切换
8. 余额不足提示

## 接入

- 将 `react/RedEnvelopeVideo.tsx` 与 CSS 文件放入 React 页面目录。
- 将 `public/assets/red-envelope-video` 复制到项目的 `public/assets`。
- 在路由中渲染 `RedEnvelopeVideo`。
- 组件只依赖 React 18+，不依赖第三方 UI 或动画库。

## 目录

- `react/`：页面组件与动效样式
- `public/assets/`：从本次视频关键帧提取的视觉素材
- `specs/layers.manifest.json`：1290px 源坐标及 750px 画板坐标
- `qa/implementation-*.png`：四个页面的 750 × 1626 实现截图
- `qa/bbox-*.png`：源视频关键帧切图框选复核

## 业务接入点

当前为前端交互 Demo。前端工程师需要把以下动作替换为真实业务：

- 点击“确定”后的接口请求
- 实际代币余额与价格
- Gas 费用计算
- 领取红包入口
- 钱包地址、红包文案和封面数据

复杂插画保留为视频原帧裁片；普通文字、按钮、输入框、键盘和底部弹层均为可编辑代码。

