<div align="center">

# 🛡️ VelaGuard 安行腕伴

### Open-Vela 2026 竞赛 · 可穿戴安全快应用

**队伍编号：** `contest2026_315_Corelink`

![Open-Vela](https://img.shields.io/badge/Open--Vela-Watch%20RTOS-00B4D8)
![AIoT Toolkit](https://img.shields.io/badge/AIoT%20Toolkit-2.0.5-4CAF50)
![Node.js](https://img.shields.io/badge/Node.js-≥20-339933)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB)

</div>

---

## 一、作品简介

**VelaGuard 安行腕伴** 是一款面向 Open-Vela 可穿戴平台的**离线优先安全辅助快应用**，聚焦老年人跌倒与异常静止的自动识别与紧急求助。

系统在腕端完成 IMU 数据采集 → 7 维特征提取 → 轻量决策树推理 → 疑似跌倒/异常静止识别 → 10 秒二次确认 → SOS 处置 → 本地留痕与断网补发的完整闭环，全程离线可用。

> ⚠️ **声明：** 本项目为比赛安全辅助原型，不用于医疗诊断，也不替代真实紧急救援服务。

**核心亮点：**

- 🌲 **端侧 ML**：Python 训练决策树 → 导出纯 JavaScript，零依赖腕端推理
- ⚡ **两阶段状态机 + 10 秒二次确认**：显著降低误报率
- 📴 **离线优先架构**：断网求助进入离线队列，联网后自动补发
- 📋 **不可变审计追溯**：撤回追加、联系人快照、完整事件时间线

## 二、选题方向

**手表应用创新（快应用）赛道**

选题理由：跌倒与异常静止是老年人独居场景下的真实安全痛点。现有方案普遍误报率高、依赖联网，本项目通过「端侧轻量 ML + 组合特征 + 二次确认 + 离线优先」的组合，提供一个可落地的安全辅助原型。

## 三、目录结构

```text
contest2026_315_Corelink/
├── quickapp/hello_quickapp/        # 作品主体（快应用源码 + 模型训练）
│   ├── src/                        #   应用源码（9 页面 + 5 核心算法模块）
│   ├── model-training/             #   决策树训练脚本（Python → JS 导出）
│   └── datasets/                   #   训练特征样本
├── logs/                           # AI Coding 对话日志（27 个会话）
│   └── xvkjdshknxs2/               #   manifest.json + 分日期 jsonl
├── app/  board/                    # 其他赛道模板（本作品未使用）
└── contest2026_315_Corelink.xml    # openvela 工程 repo manifest
```

作品详细说明、架构图与核心算法设计见 [quickapp/hello_quickapp/README.md](quickapp/hello_quickapp/README.md)。

## 四、运行方式

### 1. 拉取工程

```bash
repo init -u https://github.com/open-vela/contest2026_315_Corelink \
  -b dev-ai-contest-2026 -m contest2026_315_Corelink.xml
repo sync -c -j8
```

### 2. 构建快应用

快应用目录已通过 manifest 软链到 openvela 编译树。进入作品目录构建：

```bash
cd quickapp/hello_quickapp
npm install
npm run build        # 生成 RPK 包
```

构建产物：`dist/com.openvela.contest.velaguard.debug.1.0.0.rpk`

或使用 **AIoT-IDE** 打开该目录，点击「运行/调试」，选择 Watch 模拟器即可。

### 3. 重新训练端侧模型（可选）

```bash
python -m pip install -r model-training/requirements.txt
npm run model:train
```

## 五、AI Coding 使用说明

本作品使用 **Claude Code** 全程辅助开发，覆盖需求拆解、算法设计、编码、调试、UI 优化与文档撰写等环节：

- **算法设计**：与 AI 共同设计跌倒检测的 7 维组合特征方案与两阶段状态机，将「4 秒窗口单次命中」的高误报方案优化为「组合特征 + 二次确认」的稳健方案
- **模型工程**：借助 AI 打通「Python 训练 → 纯 JS 导出」的端侧模型部署管线
- **UI/UX**：借助 AI 完成 466×466 圆形表盘适配、安全区布局与界面美化
- **文档**：由 AI 辅助撰写作品说明与部署文档

完整对话日志见 [`logs/`](logs/)（27 个会话、5000+ 事件，已做敏感信息脱敏）。

---

<div align="center">

**Team `contest2026_315_Corelink` · VelaGuard 安行腕伴**

*离线守护，安全随行*

</div>
