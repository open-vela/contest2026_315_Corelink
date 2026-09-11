<div align="center">

# 🛡️ VelaGuard 安行腕伴

### Open-Vela 2026 竞赛 · 可穿戴安全快应用

**队伍编号：** `contest2026_315_Corelink`
**适配平台：** Open-Vela Watch（圆角方形表盘）
**应用包名：** `com.openvela.contest.velaguard`

![Open-Vela](https://img.shields.io/badge/Open--Vela-Watch%20RTOS-00B4D8)
![AIoT Toolkit](https://img.shields.io/badge/AIoT%20Toolkit-2.0.5-4CAF50)
![Node.js](https://img.shields.io/badge/Node.js-≥20-339933)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB)

</div>

---

## 📖 项目简介

**VelaGuard 安行腕伴** 是一款面向 Open-Vela 可穿戴平台的 **离线优先安全辅助原型**。系统在腕端完成 IMU 数据采集、特征提取、轻量决策树推理、疑似跌倒/异常静止识别、10 秒二次确认、SOS 处置、本地留痕与断网补发的完整闭环。

> ⚠️ **声明：** 本项目为比赛安全辅助原型，不用于医疗诊断，也不替代真实紧急救援服务。

### 核心能力一览

| 能力 | 说明 |
|:---|:---|
| 🏃 端侧 IMU 分析 | 7 维特征提取（峰值/谷值/方差/冲击后方差/姿态变化/低运动占比/窗口时长） |
| 🌲 轻量决策树推理 | `max_depth=4` 决策树，Python 训练 → 导出为纯 JavaScript，零依赖端侧推理 |
| ⚡ 疑似事件二次确认 | 检测到风险后进入 10 秒倒计时，支持"我没事"取消或"立即求助" |
| 📴 离线优先架构 | 网络故障注入 → 求助进入离线队列 → 联网后自动补发，完整状态留痕 |
| 📋 完整审计追溯 | 每个事件保存判断依据、消息快照、联系人通知顺序、不可变时间线 |
| 🔄 撤回追加设计 | 求助撤回采用追加事件而非覆盖，原始记录永久保留 |
| 🎯 5 种可复现场景 | 日常步行、正常跑步、剧烈晃动、疑似跌倒、异常静止 |

---

## 📦 环境依赖

### 开发环境

| 依赖项 | 版本要求 | 说明 |
|:---|:---|:---|
| **操作系统** | Windows 10/11 | AIoT-IDE 官方支持 |
| **AIoT-IDE** | 最新版 | 小米 AIoT 开发 IDE，内置 Node.js 20 |
| **AIoT Toolkit** | `2.0.5` | 构建与打包工具链 |
| **Node.js** | `≥ 20` | IDE 内置或本地安装均可 |
| **Python** | `3.10+` | 仅模型训练需要 |

### Python 依赖（仅模型训练）

| 包名 | 版本 | 用途 |
|:---|:---|:---|
| `numpy` | `1.26.4` | 数值计算 |
| `scikit-learn` | `1.4.2` | 决策树训练与评估 |

### 前端依赖（package.json）

| 包名 | 版本 | 用途 |
|:---|:---|:---|
| `aiot-toolkit` | `^2.0.5` | Open-Vela 应用构建工具链 |
| `@aiot-toolkit/jsc` | `^1.0.3` | JavaScript 编译器 |

---

## 📁 项目目录结构

```
watch1/
├── README.md                          # 项目文档
├── package.json                       # 前端依赖与构建脚本
├── package-lock.json                  # 依赖锁定文件
│
├── src/                               # ===== 应用源码 =====
│   ├── app.ux                         # 应用入口（全局状态管理）
│   ├── manifest.json                  # 应用清单（包名、路由、系统权限）
│   ├── config-watch.json              # 设备配置
│   ├── i18n/                          # 国际化
│   │   ├── defaults.json
│   │   ├── en.json
│   │   └── zh-CN.json
│   ├── common/                        # ===== 核心算法模块 =====
│   │   ├── fall-model.js              # IMU 窗口管理 + 7 维特征提取 + 评估入口
│   │   ├── generated-model.js         # Python 训练导出的决策树（纯 JS，零依赖）
│   │   ├── event-machine.js           # 事件状态机（告警创建/解决/撤回/消息构建）
│   │   ├── sensor-replay.js           # 5 种可复现场景的 IMU 数据回放引擎
│   │   └── storage.js                 # 本地持久化（事件/设置/联系人/离线队列）
│   └── pages/                         # ===== UI 页面 =====
│       ├── cover/cover.ux             # 启动封面页
│       ├── home/home.ux               # 首页（状态卡片、实时指标、SOS、导航）
│       ├── scenarios/scenarios.ux     # 场景测试页（5 种 IMU 回放 + 实时指标）
│       ├── alert/alert.ux             # 安全确认页（倒计时、判断依据、消息预览）
│       ├── history/history.ux         # 事件历史列表
│       ├── all-events/all-events.ux   # 全部事件视图
│       ├── event-detail/event-detail.ux # 事件详情（概览/消息/时间线三页签）
│       ├── contacts/contacts.ux       # 紧急联系人管理（P1/P2 优先级）
│       └── settings/settings.ux       # 演示设置（离线注入、IMU 数据源切换）
│
├── model-training/                    # ===== 模型训练 =====
│   ├── train_and_export.py            # 训练脚本（合成数据 + CSV → 决策树 → JS 导出）
│   └── requirements.txt               # Python 依赖
│
├── datasets/                          # ===== 训练数据 =====
│   ├── README.md                      # 数据集说明与字段定义
│   └── training_features.csv          # 7 维特征样本（用于工程链路验证）
│
├── build/                             # 构建中间产物
└── dist/                              # ===== 构建输出 =====
    └── com.openvela.contest.velaguard.debug.1.0.0.rpk
```

---

## 🚀 快速开始

### 方式一：AIoT-IDE 图形化运行（推荐）

1. 使用 **AIoT-IDE** 打开 `watch1` 目录
2. 等待依赖自动安装完成
3. 点击顶部 **"运行/调试"**
4. 选择 **Watch 模拟器**

### 方式二：命令行构建

```powershell
# 1. 进入项目目录
cd watch1

# 2. 安装前端依赖
npm install

# 3. 构建 RPK 包
npm run build
```

构建成功后产物路径：

```
dist/com.openvela.contest.velaguard.debug.1.0.0.rpk
```

### 模型训练（可选）

```powershell
# 安装 Python 依赖
python -m pip install -r model-training/requirements.txt

# 使用 CSV + 合成数据训练并导出端侧模型
npm run model:train

# 仅使用确定性合成数据验证完整管线
python model-training/train_and_export.py --synthetic-only
```

> 训练完成后重新执行 `npm run build`，新模型自动进入 RPK 包。

---

## 🏗️ 核心工程架构

### 整体架构图

```
┌─────────────────────────────────────────────────────┐
│                    UI Layer (.ux)                     │
│  home → scenarios → alert → event-detail → history   │
│                    contacts / settings                │
├─────────────────────────────────────────────────────┤
│                  Business Logic (JS)                  │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ fall-model   │  │ event-machine│  │  storage     │ │
│  │ · 窗口管理   │  │ · 状态机     │  │ · 持久化     │ │
│  │ · 特征提取   │  │ · 消息构建   │  │ · 离线队列   │ │
│  │ · 评估入口   │  │ · 撤回追加   │  │ · 自动补发   │ │
│  └──────┬──────┘  └──────────────┘  └─────────────┘ │
│         │                                             │
│  ┌──────▼──────┐  ┌──────────────┐                   │
│  │ generated-   │  │ sensor-replay│                   │
│  │ model.js     │  │ · 5 种场景   │                   │
│  │ · 决策树推理 │  │ · 80ms 采样  │                   │
│  └─────────────┘  └──────────────┘                   │
├─────────────────────────────────────────────────────┤
│              Open-Vela System APIs                    │
│  system.sensor │ system.storage │ system.network      │
│  system.vibrator │ system.router                      │
└─────────────────────────────────────────────────────┘
```

### 技术亮点

#### 1. Python → JavaScript 模型导出管线

```
合成数据 + CSV → scikit-learn DecisionTree(max_depth=4)
    → 递归遍历 tree_ 结构 → 纯 JavaScript if-else 函数
```

- 模型导出为 `generated-model.js`，**零外部依赖**，可直接在腕端执行
- 运行时回归测试：5 个锚点场景（步行/跑步/晃动/跌倒/静止）确保训练-推理一致性

#### 2. 组合特征设计，拒绝"单峰值误判"

| 特征 | 含义 | 设计意图 |
|:---|:---|:---|
| `peakG` | 合加速度峰值 | 捕捉冲击事件 |
| `minG` | 合加速度最小值 | 检测失重阶段 |
| `variance` | 完整窗口方差 | 区分剧烈运动与短暂冲击 |
| `postVariance` | 窗口尾部方差 | 冲击后是否趋于静止 |
| `orientationChange` | Z 轴首尾变化 | 检测姿态翻转 |
| `lowMotionRatio` | 低运动采样占比 | 量化冲击后静止程度 |
| `durationMs` | 窗口时长 | 区分瞬时与持续异常 |

> **核心设计原则：** 高峰值不是充分条件。跌倒需要失重、冲击、姿态变化和冲击后静止的 **组合** 才能触发。

#### 3. 离线优先事件状态机

```
检测到风险 → 进入确认(10s)
    ├─ 超时 → 生成求助 → [联网] 已发送 / [离线] 待发送
    ├─ "立即求助" → 生成求助 → [联网] 已发送 / [离线] 待发送
    └─ "我没事" → 取消事件，保留记录

已发送事件 → "我已安全" → 追加撤回更新（原始求助不删除）

离线队列 → 网络恢复 → flushQueuedEvents() → 补发 + 时间线留痕
```

#### 4. 不可变审计追溯

- 联系人在事件发生时形成 **快照**，之后修改不篡改旧事件证据
- 求助撤回采用 **追加事件** 设计，原始记录永久保留
- 每个事件维护完整 **时间线**：检测 → 确认 → 发送/取消 → 撤回/补发

#### 5. 场景回放引擎

5 种可复现场景通过数学函数确定性生成 IMU 数据（80ms 采样间隔），确保：

- **演示可复现**：相同场景每次结果一致
- **误报验证**：跑步和剧烈晃动不会触发误报
- **无需硬件**：模拟器上即可完成完整演示

---

## 📄 许可证

本项目为 Open-Vela 2026 竞赛参赛作品，仅供学习与评审使用。

---

<div align="center">

**Team `contest2026_315_Corelink` · VelaGuard 安行腕伴**

*离线守护，安全随行*

</div>
