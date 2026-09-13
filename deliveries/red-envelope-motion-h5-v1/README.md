# 红包封面动效 H5 前端交付包

这是一个可以独立交给前端工程师的源码包，不需要把整个 FlowForge 演示网站一起发送。

## 模板定位

这个目录现在作为后续 H5 动效项目的基础模板。正确流程是：先复制模板，再替换素材与文案，最后调整动画参数；不要把视频逐帧截图直接拼成超宽精灵图。

- 页面骨架、750px 缩放和交互逻辑保持稳定。
- 复杂角色使用透明 PNG、WebP、SVG 或 Lottie 作为独立运动层。
- 卡片背景、前景遮挡、角色和光效分别成层。
- 高频动画只修改 `transform` 与 `opacity`。
- 新项目的差异通过素材和配置表达，不重新发明动画结构。
- 详细约束见 `specs/template-contract.json`。

## 包内内容

- `react/RedEnvelopeMotion.tsx`：React 页面组件与交互逻辑
- `react/red-envelope-motion.css`：750px H5 布局及全部动画
- `public/assets/`：透明角色素材
- `specs/motion-spec.json`：动效参数说明
- `specs/layers.manifest.json`：设计图层与坐标清单

## 接入方法

1. 将 `react/RedEnvelopeMotion.tsx` 和 CSS 文件复制进项目页面目录。
2. 将 `public/assets/red-envelope-motion` 整个目录复制到项目的 `public/assets` 下。
3. 在路由中渲染 `RedEnvelopeMotion` 组件。
4. 素材默认使用绝对路径：
   `/assets/red-envelope-motion/illustrations/illustration-red-envelope-cat-horse-01.png`。
5. 如果项目不是 Next.js，只要支持 React 与普通 CSS，也可以直接使用；按项目规范调整组件文件名与路由即可。

## 技术信息

- 设计基准：750 × 1626
- 自动适配手机屏幕宽度
- 动画只使用 `transform` 和 `opacity` 作为主要动态属性
- 支持 `prefers-reduced-motion`
- 点击红包卡片切换选中状态
- 点击“下一步”显示确认面板

## 前端可替换内容

- 钱包地址及祝福语位于 `RedEnvelopeMotion.tsx`
- 动画周期及幅度位于 CSS 的 `character-float`、`character-breathe`
- 确认事件目前是本地交互，可替换为业务接口或路由跳转
