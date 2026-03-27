# 众说 - Vino的哲学实验室

一个 AI 驱动的哲学探索平台，通过与哲学家对话和审判机提问，帮助用户发现自己的哲学底色。

![众说](https://vinolab.tech)

---

## 🎯 产品简介

**众说** 不是一次普通的测试。拉动命运的拉杆，抽取一个当下最需要面对的哲学命题，与伟大的哲学家进行一对一的思想碰撞，最终生成专属于你的**哲学底色报告**。

支持中文 / English，随时切换语言。

---

## ✨ 核心功能

### 哲学对话模式
用户从 8 种哲学命题中抽取命运卡牌，开启对话之旅：

| 模式 | 描述 |
|------|------|
| 人生意义 | 存在、痛苦与终极价值 |
| 何为正义 | 分配正义与社会契约 |
| 我是谁？ | 考古你的自我本质 |
| 自由意志 | 你是否只是生物机器？ |
| 模拟假说 | 红蓝药丸的抉择 |
| 他者意识 | 唯我论与哲学僵尸 |
| 语言边界 | 我们能理解彼此吗？ |
| 科学真理 | 发现真理还是发明模型？ |

### 双阶段对话机制
1. **审判机阶段** — AI 审判机提出尖锐问题，称量你的哲学立场
2. **哲学家阶段** — 选中的哲学家基于自身思想体系进行反驳与追问

### 对话强度
- **直觉相遇 (Quick)** — 约 8 轮高频互动
- **深度追问 (Deep)** — 无上限轮次，直到真相浮现

### 哲学底色报告
对话结束后，AI 综合分析生成完整报告，包含：
- 真我能量矩阵（多维度评分）
- 关键哲学洞察
- 推荐哲学路径
- 个人哲学箴言

### 其他功能
- **哲学家库** — 查看所有可用哲学家及其思想简介
- **历史记录** — 保存对话历史，继续未完成的探索
- **先令系统** — tokens 消耗与余额管理
- **一键导出** — 将报告导出为图片分享

---

## 🏗️ 技术架构

### 前端
- **框架**: React 19 + TypeScript
- **构建**: Vite 6
- **样式**: Tailwind CSS
- **图标**: Lucide React
- **AI 服务**: Google Gemini / DeepSeek（可切换）

### 后端（独立部署）
- **框架**: Express.js（Node.js）
- **数据库**: MySQL
- **API**: RESTful + 流式响应

### 数据库表结构

| 表名 | 用途 |
|------|------|
| `all_accounts` | 用户账号系统 |
| `ik_philosophers` | 哲学家数据库 |
| `ik_questions` | 问题库 |
| `ik_user_conversations` | 用户对话历史 |
| `ik_analysis_reports` | 分析报告 |
| `al_apikeys` | API Key 管理 |

---

## 📁 项目结构

```
zhinanz-main/
├── App.tsx                 # 主应用组件（含所有页面状态）
├── index.html              # HTML 入口
├── index.tsx               # React 入口
├── types.ts                # TypeScript 类型定义
├── vite.config.ts          # Vite 配置
├── package.json
├── components/
│   ├── ChatBubble.tsx       # 聊天气泡组件（含打字机效果）
│   ├── ChatSidebar.tsx      # 聊天页面侧边栏
│   ├── HistorySidebar.tsx    # 历史记录侧边栏
│   ├── PhilosopherIntro.tsx  # 哲学家介绍弹窗
│   ├── PhilosopherTopicSelect.tsx  # 哲学家话题选择
│   ├── PhilosophersLibrary.tsx    # 哲学家库弹窗
│   └── ProgressBar.tsx       # 进度条组件
├── services/
│   ├── aiService.ts         # AI 服务（流式对话、报告生成）
│   ├── apiClient.ts          # 后端 API 客户端
│   ├── geminiService.ts      # Gemini API 封装
│   └── philosophyApi.ts       # 哲学模块 API
└── constants/
    └── questions.ts          # 问题池常量
```

---

## 🚀 本地开发

### 前置要求
- Node.js >= 18
- npm 或 yarn

### 安装与运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 `http://localhost:5173`

### 环境变量

创建 `.env` 文件：

```env
VITE_API_BASE_URL=https://vinolab.tech
```

### 构建生产版本

```bash
npm run build
npm run preview   # 预览构建结果
```

---

## 🌐 API 接口

基础地址：`https://vinolab.tech/api`

### 认证
- `POST /auth/login` — 登录
- `POST /auth/register` — 注册

### 哲思模块
- `GET /philosophy/user-histories/:userId` — 获取用户历史记录列表
- `GET /conversations?user_id=&session_id=` — 获取对话详情
- `POST /conversations` — 保存对话
- `GET /reports?user_id=&session_id=` — 获取分析报告
- `POST /reports` — 保存分析报告
- `GET /philosophy/questions` — 获取问题库
- `GET /philosophy/philosophers` — 获取哲学家列表
- `POST /philosophy/user/tokens` — 更新用户 tokens

### 运何模块
- `GET /fortune/bazi/:userId` — 八字历史
- `GET /fortune/liuyao/:userId` — 六爻历史
- `GET /fortune/explore` — 文章列表
- `GET /fortune/banners` — 横幅列表

---

## 🎨 页面流程

```
登录/注册 → 首页（抽取命运卡牌）→ 选择强度 → 对话页
                                                 ↓
                                           生成报告 → 报告页（可导出分享）
```

---

## 🔑 主要概念

- **先令 (Tokens)** — 平台虚拟货币，用于对话和生成报告
- **审判机** — AI 角色，负责提出哲学问题
- **哲学家** — 对话伙伴，基于历史哲学家思想体系
- **Session** — 一次完整的对话会话，结束后可生成报告

---

## 📝 许可证

私有项目，仅供 Vinolab 内部使用。
