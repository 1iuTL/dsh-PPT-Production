# 本机验证记录

日期：2026-11-23
环境：Windows · Node v24.22.2 · DSH 桌面 profile

## 离线测试

```text
node --test "tests/*.test.mjs"
→ tests 59 / pass 59 / fail 0
```

覆盖：deck 模型校验、五个原创风格与版权护栏、HTML 转义与无外部资源、pptx 真实文本 run、zip 读写、build→read 往返、六种 patch、五个工具（fake Context）、deck_plan 大纲归一、工作台快照、client 模块注册（tab type / body / toolview / input dock）、颜色换算与删除、强调色附属色按页轮换、skill async provider（含 `list()` candidate 必须带字符串 `source` 的回归）、systemPrompt section。

```text
node scripts/spike.mjs
→ spike PASS: pptx 含真实 <a:t> 文本框，ShapeType.rect 可用，含备注
```

## 安装

```text
plugin_manager action=install_bundle target=<repo>
→ application: applied
→ warnings: []
```

安装后本会话可见 `deck_styles / deck_plan / deck_build / deck_read / deck_edit`，`deck-maker` skill 进入 skill 目录，systemPrompt 策略段生效。

2026-11-23 追加 **内置工作台**（右侧栏 `PPT 工作台` tab + 输入区 headless 自动展开 + `/dsh-ppt-production/state` 路由）。代码与离线注册测试已就位；重装后实测：

- `cordis_inspect_query` 的 `sidebar.right.pane.tab` occupants 含 `key: dsh-ppt-production`，`active: true`。
- `conversation.input.dock` occupants 含 `id: dsh-ppt-production.auto`，`active: true`；它不渲染可见条，只在 `planUpdatedAt` 变化时展开右侧栏。
- `GET /dsh-ppt-production/state` 返回 200；`deck_plan` 后 `plan` 更新，`deck_build` 后 `build` 更新，`styles` 5 个。
- 自动展开实测：`deck_plan` 更新 `planUpdatedAt` 后约 1 秒，state 返回 `openedAt`；说明 `sidebarRight.openTab` 已执行。
- Workbench 组件用 `react-dom/server` 离线渲染通过（12,032 bytes，含“PPT 工作台 / 幻灯片大纲 / 视觉风格 / 背景色 / dsm-picker”）。
- `deck_plan` 的对话工具视图已注册：`tool.call.toolview` key `deck_plan`；计划卡含标题、`N 张幻灯片 · 字体`、展开/收起和“查看大纲”。
- 自定义取色器：色域方块 + 色相条 + HEX + RGB/HSB/CMYK；颜色换算断言通过；custom tab server-render 12,032 bytes（含 `dsm-picker` / 背景色）。
- **工作台批准闭环实测**（2026-11-23 13:14）：工作台“批准并构建”发出的 `【PPT 工作台 批准构建】` 消息到达模型 → 按 plan/style 调用 `deck_build` → 3 页 pptx（cover / title-body / closing）→ `deck_read` 文本一致 → `present` 交付。
- 浏览器里的实际渲染与交付卡点击预览需用户在当前页面确认。

## 端到端冒烟

1. `deck_styles` 返回 5 个原创风格。
2. `deck_build` 用 3 页 deck 产出三件套（cover / title-body / closing）。
3. `deck_read` 读回 3 页；文本与 build 一致；`ppt/notesSlides/` 存在。
4. `deck_edit` 把第 2 页标题改为 `三个验证点（已改）`；重建后 `deck_read` 与 HTML 均更新。
5. 产物：`PPT 工作台-冒烟.pptx` 约 59 KB，`slide1.xml` 含 2 个 `<a:t>` run；HTML 无 `<script>`。

## GitHub 发布（2026-11-23）

- 仓库：https://github.com/1iuTL/dsh-PPT-Production （public，MIT，default branch `main`）
- 包名：`dsh-ppt-production`；仓库名按用户指定为 `dsh-PPT-Production`
- Release：https://github.com/1iuTL/dsh-PPT-Production/releases/tag/v1.0.0
- 资产：`dsh-ppt-production.tgz`（197,983 bytes，由 `.github/workflows/release.yml` 在 release 事件中构建并上传）
- Actions `release` run：success
- 本机 `github.com:443` 推送被网络阻断，仓库内容通过 GitHub Git Data API 以快照提交发布；本地 git 历史未直接 push。后续更新需网络恢复后用 API 重新发布，或重新配置可用的 GitHub 入口。

## 未验证 / 限制

- **工作台 UI**：右侧栏、计划卡、自动展开、取色器输入、批准消息、右键删除与菜单边界已通过真实 DSH 渲染进程实测；取色器拖拽和最终交付卡视觉仍需人工复核。
- **视觉**：本机未安装 PowerPoint/WPS/LibreOffice 到 PATH；PPTX 的视觉检查走 DSH 右侧内置文档预览（交付卡点击后本地转 PDF）。外部 PowerPoint/WPS 只在需要直接编辑时使用。
- HTML 预览只是布局近似，不等于 pptx 像素。
- `deck_read` 是只读摘要，不是完整 OOXML 解析。
- 外部已有 pptx 的无损原生编辑不在 MVP。
- 工作台状态按会话键隔离；无会话键的旧调用回退到 `default`。重启进程后状态清空，尚未持久化。
