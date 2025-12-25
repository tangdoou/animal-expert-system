# 🦁 动物识别专家系统

基于产生式系统的动物识别专家系统，实现正向推理和反向推理功能。

## ✨ 功能特性

- **正向推理**：从已知特征推导动物（自底向上）
- **反向推理**：从目标动物验证特征（自顶向下）
- **规则管理**：支持增删改产生式规则
- **可视化推理**：展示完整推理路径

## 🏗️ 技术架构

| 组件 | 技术 |
|------|------|
| 后端 | Python + Flask |
| 前端 | HTML + CSS + JavaScript |
| 存储 | JSON 文件 |

## 📦 知识库

- **20 条产生式规则**
- **12 种可识别动物**：虎、豹、狮子、狼、斑马、长颈鹿、牛、马、企鹅、鸵鸟、信天翁、老鹰
- **27 种特征**

## 🚀 快速开始

### 安装依赖

```bash
pip install -r requirements.txt
```

### 运行

```bash
python app.py
```

然后访问 http://127.0.0.1:5000

## 📸 系统截图

### 正向推理
![正向推理](screenshots/03_forward_result_tiger.png)

### 反向推理
![反向推理](screenshots/backward_reasoning_penguin_success.png)

### 规则管理
![规则管理](screenshots/05_rules_list.png)

## 📁 项目结构

```
├── app.py                 # Flask 后端（推理引擎 + API）
├── rules.json             # 规则库数据
├── requirements.txt       # Python 依赖
├── static/
│   ├── css/style.css      # 样式文件
│   └── js/main.js         # 前端逻辑
├── templates/
│   └── index.html         # 主页面
└── screenshots/           # 系统截图
```

## 📖 理论基础

本系统基于《人工智能与专家系统》（第二版）：
- P19 例 2.7：动物识别规则库
- 5.3.2 节：正向推理机

## 📄 License

MIT License
