# 红包发送流程 H5 v2

## v2 新增

- 红、绿、橙三款视频原始封面素材
- 点击两侧封面切换
- 手机横向滑动切换
- 520ms 惯性停靠动画
- 每张封面的漂浮、呼吸、扫光、闪光粒子和阴影跟随
- 封面变化时同步切换页面背景主题色
- 进入红包个数页后保留当前选择的封面

## 接入方法

1. 将 `react/RedEnvelopeVideo.tsx` 与 CSS 放入 React 页面目录。
2. 将 `public/assets/red-envelope-video` 复制到项目的 `public/assets`。
3. 在项目路由中渲染 `RedEnvelopeVideo`。
4. 组件仅依赖 React 18+，不依赖第三方 UI 或动画库。

## 交付目录

- `react/`：React 组件和 CSS 动画
- `public/assets/`：从本次视频 4.0、6.2、8.0 秒帧提取的封面与页面素材
- `specs/layers.manifest.json`：1290px 源坐标和 750px 定稿坐标
- `qa/implementation-cover-red.png`
- `qa/implementation-cover-green.png`
- `qa/implementation-cover-orange.png`
- `qa/bbox-cover-red.png`、`bbox-cover-green.png`、`bbox-cover-orange.png`

复杂人物仍然是原视频帧位图，MG 生命感通过 GPU 友好的 `transform` 与 `opacity` 叠加实现。若需要猫的耳朵、手臂、尾巴分别运动，必须取得原始分层工程或重新制作分层素材。

