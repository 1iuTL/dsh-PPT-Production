# PPT 工作台（dsh-ppt-production）交接说明

> 日期：2026-11-23
> 交接原因：高峰期调用成本高，用户先暂停，由下一位 agent 接手完善。
> 约束：**零支出**。不要调用付费 API / 云服务；本地测试、本地渲染、免费额度优先。

---

## 0. 给下一位 agent 的第一条指令

先按这个顺序读，不要一上来改代码：

1. `dsh-ppt-plugin/README.md`
2. `dsh-ppt-plugin/docs/DETAIL.md`
3. `dsh-ppt-plugin/src/tools.mjs`（5 个工具与状态写入）
4. `dsh-ppt-plugin/client.js`（右侧工作台、计划卡、取色器、自动展开）
5. `dsh-ppt-plugin/src/render-pptx.mjs`（原生 pptx）
6. `dsh-ppt-plugin/docs/VALIDATION.md`（已验证/未验证）
7. 本文

快速验收入口：

```powershell
cd C:\Users\Administrator\Documents\deepseek-harness\default-workspace\dsh-ppt-plugin
node --test "tests/*.test.mjs"
# 期望 tests 40 / pass 40
```

---

## 1. 产品是什么

**PPT 工作台**：DSH 的纯 Host + Client UI 插件。

- 用户说“制作 PPT” → AI 调 `deck_plan` → 对话里出现**计划卡**，右侧**自动展开 PPT 工作台**。
- 工作台里：编辑逐页大纲、选风格（建议/预设/自定义）、Photoshop 风格取色器、多色分组、右键删除颜色。
- 点“批准并构建” → 批准消息回到模型 → `deck_build` 生成**原生可编辑 pptx**（真实文本框，不是整页 PNG）→ `present` 交付。
- 点击交付卡 → DSH 右侧内置文档预览（PPTX 本地转 PDF），不需要外部 PowerPoint。

核心原则：`.deck.json` 模型是唯一事实源；pptx 与 HTML 都是构建产物；改稿用 `deck_edit` 改模型再重建。

---

## 2. 当前发布状态

| 项 | 值 |
|---|---|
| GitHub 仓库 | https://github.com/1iuTL/dsh-PPT-Production |
| 可见性 / 许可 | public / MIT |
| 默认分支 | `main` |
| Release | https://github.com/1iuTL/dsh-PPT-Production/releases/tag/v1.0.0 |
| Release 资产 | `dsh-ppt-production.tgz`，197,983 bytes，由 GitHub Actions 上传 |
| 包名 | `dsh-ppt-production`（仓库名按用户要求显示为 `dsh-PPT-Production`） |
| 本地源码 | `C:\Users\Administrator\Documents\deepseek-harness\default-workspace\dsh-ppt-plugin` |
| 本地分支 | `master`，HEAD `e210164`，工作树干净 |
| 远端 main | 快照提交 `e939e79`（Initial commit + release 快照） |

**重要网络事实：**

- 本机 `github.com:443` 被阻断，`git push` 失败。
- `api.github.com` 可用；仓库内容是通过 **GitHub Git Data API** 发布的快照，不是本地完整历史。
- 本地 `master` 的完整提交历史没有推到远端；`origin` 已设置为上面仓库，但直接 `git push` 会失败/分叉。
- 以后更新代码可选：
  1. 网络恢复后，用可访问 github.com 的终端把本地历史 force-push 到 `main`（会替换远端快照历史，需确认）；
  2. 继续用 GitHub API 发新快照提交；
  3. 不再依赖本地历史，直接把工作区当源码仓库维护。
- Release 资产是 GitHub Actions 在 `release` 事件里执行 `npm pack` 生成的，**以 Release 资产为准**；本地 `dsh-ppt-production.tgz` 可能落后于远端资产，不要拿它当发布版本。

---

## 3. 已安装状态

- 当前 desktop profile 已 link 安装：`dsh-ppt-production`，`application: applied`，`warnings: []`。
- 5 个工具已生效：`deck_styles / deck_plan / deck_build / deck_read / deck_edit`。
- `deck-maker` skill、systemPrompt 策略段已加载。
- 客户端已注册：
  - 右侧 tab：`sidebar.right.pane.tab` key `dsh-ppt-production`
  - 计划卡：`tool.call.toolview` key `deck_plan`
  - headless 自动展开：`conversation.input.dock` id `dsh-ppt-production.auto`
- `/dsh-ppt-production/state` 返回 200；`deck_plan` 后 `openedAt` 会写入，证明自动展开执行过。
- 当前工作台状态是进程级单例；重启/重装会清空。最后一次内容为「1+1=2 的积分解释」相关计划与构建。

---

## 4. 代码结构

```text
dsh-ppt-plugin/
├─ index.js                 # Host 入口：tools + webServer 路由 + skills + prompt
├─ client.js                # 浏览器半：工作台、计划卡、自动展开、取色器、右键菜单
├─ cordis.patch.yml         # insert dsh-ppt-production
├─ package.json             # name/version/files/client/install
├─ src/
│  ├─ tools.mjs             # 5 个工具注册、buildAll、styleOverrides 合并
│  ├─ model.mjs             # normalize/validate；styleOverrides 校验
│  ├─ plan.mjs              # deck_plan 的 outline 归一
│  ├─ workbench-state.mjs   # 进程级 plan/build/openedAt 快照
│  ├─ workbench-route.mjs   # GET /state、POST /opened
│  ├─ skill.mjs             # deck-maker async provider
│  ├─ prompt.mjs            # systemPrompt 段
│  ├─ styles.mjs            # 5 套原创风格
│  ├─ render-pptx.mjs       # PptxGenJS 原生 pptx；accent extras 按页轮换
│  ├─ render-html.mjs       # 单文件 HTML 预览
│  ├─ read-pptx.mjs         # deck_read
│  ├─ edit.mjs              # deck_edit patch
│  ├─ zip.mjs / xml.mjs     # 零依赖 unzip / XML 文本抽取
├─ vendor/pptxgen.bundle.mjs# PptxGenJS 3.12.0 esbuild ESM bundle（含 createRequire banner）
├─ skills/deck-maker/SKILL.md
├─ tests/                   # 40 个离线测试
├─ docs/                    # DETAIL / VALIDATION
├─ .github/workflows/release.yml
└─ HANDOFF.md               # 本文
```

### 工具契约

| 工具 | 参数 | 产出 |
|---|---|---|
| `deck_styles` | 无 | 5 个原创风格摘要 |
| `deck_plan` | `plan`（title/audience/recommendedStyle/slides）、`style?` | 登记到工作台，返回 plan + hint |
| `deck_build` | `deck`、`style?`、`outDir?` | `.deck.json` + `.pptx` + `.preview.html` |
| `deck_read` | `path` | 页数 / 每页文本 / shape/pic 计数 |
| `deck_edit` | `modelPath`、`patch`、`outDir?` | 改模型后重建三件套 |

`deck` 模型：`{ meta:{title,author,subject,createdAt}, style, styleOverrides?, slides[] }`
`slide.layout ∈ cover | section | title-body | two-col | image | closing`
`patch.op ∈ set-text | set-body | swap-image | delete-slide | reorder | add-slide`

### styleOverrides

- 主色：`bg / ink / accent`（#RRGGBB）
- 附属色：`extras: { bg:[], ink:[], accent:[] }`
- 当前渲染：**强调色 extras 按页轮换到页眉色条**；背景/正文 extras 已保存但尚未接入具体版式。
- `src/tools.mjs` 的 `resolveStyle` 负责过滤/合并；`src/render-pptx.mjs` 用 `style.extras.accent`。

### 工作台 / 客户端

- `deck_plan` → 状态 `planUpdatedAt` 更新 → `client.js` 的 `WorkbenchAutoOpen` 轮询 `/dsh-ppt-production/state` → 调 `sidebarRight.openTab('dsh-ppt-production')` → POST `/opened` 写 `openedAt`。
- 计划卡是 `tool.call.toolview` key `deck_plan`，不是输入框条。
- 工作台三种颜色分类（背景/正文/强调）→ 二级 `主色 / 附属色 n / +`；右键颜色 → “删除此颜色”；主色删除时由第一条附属色顶上，没有附属色时禁用。
- 取色器：SV 色域、色相条、HEX、RGB/HSB/CMYK。
- 批准消息前缀：`【PPT 工作台 批准构建】`；建议更改前缀：`【PPT 工作台 建议更改】`。

---

## 5. 验证状态

已验证：

- `node --test "tests/*.test.mjs"` → **40/40 pass**
- `node scripts/spike.mjs` → PptxGenJS 真实 `<a:t>` 文本 + notes + ShapeType.rect
- build → deck_read 往返文本一致
- `deck_edit` 改标题后重建内容更新
- 多色 extras 集成测试：第 2 页出现 `FF0000`
- 客户端 slot：tab body / `deck_plan` toolview / input dock auto-open 均 active
- `GET /dsh-ppt-production/state` 200；`openedAt` 在 plan 更新后写入
- 工作台与计划卡通过 `react-dom/server` 离线渲染（含自定义取色器）
- GitHub Release + Actions 上传资产成功

**未验证 / 需要下一任做：**

1. **真实浏览器视觉**：计划卡、右侧工作台、PS 取色器拖拽、多色二级栏、右键菜单位置/裁剪、自定义色板构建出的 pptx 是否好看。server-render 不等于视觉正确。
2. 右键菜单的 fixed 定位在某些侧栏 transform/overflow 下可能被裁剪；需要实际点一次。
3. 背景/正文 extras 还没有进入渲染。
4. `workbench-state` 是进程级全局，多会话会串 plan/build；需要按 session 隔离或持久化。
5. `deck_read` 是正则摘要，不是完整 OOXML；外部已有 pptx 的无损原生编辑不在 MVP。
6. 本地 git 历史与远端快照分叉，发布流程需要重新设计（见 §2）。
7. 版本仍为 `1.0.0`；后续功能应升 `1.1.0` 并重新生成 Release 资产。

轨迹视图里看到 `deck_plan` 的原始 JSON 是 **DSH 的轨迹/统计视图**，不是聊天流；聊天流是计划卡。不要试图在插件里隐藏轨迹参数。

---

## 6. 建议的下一步（按优先级）

### P0：浏览器验收与修 UI

- 打开当前页面，确认：
  - 计划卡是否真的替代了 `deck_plan` 的通用工具行；
  - 右侧工作台是否自动展开；
  - 自定义页签的 PS 取色器拖拽/数值输入；
  - 背景/正文/强调各加 2 个附属色；
  - 右键颜色 → 删除此颜色；
  - 主色删除是否按“第一条附属色顶上”；
  - 批准并构建 → `deck_build` → `present` → 交付卡 → 右侧预览。
- 如有问题，改 `client.js` 后重装/刷新验证。

### P1：把“多色”真正用起来

- 背景 extras：可用于 section/closing 页背景或卡片底色；
- 正文 extras：可用于强调句/引用/表格表头；
- 强调 extras 已用于色条，可扩展到 bullet marker、图表系列色。
- 注意对比度与可读性，不要为了彩色牺牲正文。

### P2：状态与发布

- 工作台状态按 `sessionId` 隔离，或至少写入磁盘/模型，避免重装丢失；
- 版本升 `1.1.0`，更新 `package.json`、tag、Release、资产；
- 补 README 截图（计划卡 + 工作台 + 取色器）；
- 需要的话向 `awesome-dsh-plugin.com` / `dshmarket.com` 索引提交收录（两者当前近似同一份 Awesome 数据，需查收录 PR 规则）。

---

## 7. 关键命令

```powershell
# 源码
cd C:\Users\Administrator\Documents\deepseek-harness\default-workspace\dsh-ppt-plugin

# 全量离线测试
node --test "tests/*.test.mjs"

# vendor spike
node scripts/spike.mjs

# 打包（发布资产名用 dsh-ppt-production.tgz）
npm pack

# 本地安装/重装（需要审批）
# plugin_manager action=install_bundle target=C:\...\dsh-ppt-plugin
# 已安装包改名/替换时：先 remove_bundle，再 install_bundle
```

GitHub API 发布（本机 github.com 被阻断时的路径）：

- 用 `git credential fill` 从 GCM 取 token（**不要把 token 打印/写文件**）。
- 通过 `POST /repos/1iuTL/dsh-PPT-Production/git/blobs` → `git/trees` → `git/commits` → `PATCH git/refs/heads/main` 发布快照。
- 新 Release：`POST /repos/.../releases`；`release` 事件触发 `.github/workflows/release.yml` 在 Actions 里 `npm pack` 并上传资产。
- 不要直接把 token 拼进 URL 或日志。

---

## 8. 红线 / 不要做

- 不调用付费 API/云服务；不批量探测模型；不做运行期 npm 安装。
- 不把 `实施规划.md`、`规划输入-资料汇总.md` 提交/发布（`files` 不包含它们；`.gitignore` 已忽略）。
- 不复制 Amazon Quick 的预设名/文案/previewHtml/图标/代码；本项目只借用交互方法，资产全部原创。
- 不要用未经验证的“结构通过”宣称视觉正确；最终视觉必须在浏览器/PPT 中看。
- 不要在 `github.com` 不可达时强行反复 `git push`；用 API 快照或等网络。
- 不要把 GitHub token、凭据写进源码、README、commit 或日志。

---

## 9. 当前已知产物

- 工作台演示 deck：`dsh-ppt-plugin/.tmp/generated/1plus1-integral/1-1-2-的积分解释.pptx`（8 页，1+1=2 的积分解释；`.tmp` 不发布）
- Release 资产：`https://github.com/1iuTL/dsh-PPT-Production/releases/download/v1.0.0/dsh-ppt-production.tgz`
- 文档：`README.md`、`docs/DETAIL.md`、`docs/VALIDATION.md`

如果下一任只做一件事：**先在浏览器里把工作台的计划卡、取色器、右键删除、批准构建完整点一遍，再决定改什么。**
