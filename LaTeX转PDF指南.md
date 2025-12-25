# LaTeX 转 PDF 快速指南

**学生**：唐一璇 (2022101068)  
**文档**：设计说明文档.md

---

## 🚀 快速开始（推荐方法）

### 方法 1：使用 Pandoc（最简单）✅

```bash
cd /Users/Apple/Downloads/专家系统

# 安装 Pandoc（如果没有）
brew install pandoc
brew install basictex  # 安装轻量级 LaTeX

# 转换为 PDF
pandoc 设计说明文档.md -o 动物识别专家系统_唐一璇_2022101068.pdf \
  --pdf-engine=xelatex \
  -V CJKmainfont="Songti SC" \
  -V geometry:margin=2.5cm \
  -V fontsize=12pt \
  --number-sections \
  --toc \
  --toc-depth=2

# 说明：
# --pdf-engine=xelatex : 支持中文
# -V CJKmainfont="Songti SC" : 使用宋体（Mac 系统自带）
# -V geometry:margin=2.5cm : 页边距 2.5cm
# -V fontsize=12pt : 字体大小 12 磅
# --number-sections : 自动给章节编号
# --toc : 生成目录
# --toc-depth=2 : 目录深度到二级标题
```

---

## 📝 完整步骤详解

### 第 1 步：检查文档

打开 `设计说明文档.md`，确认：
- ✅ 个人信息已填写（姓名、学号）
- ✅ GitHub 链接已添加
- ✅ 所有章节内容完整

### 第 2 步：安装依赖

```bash
# 检查是否已安装 Pandoc
pandoc --version

# 如果没有，安装 Pandoc
brew install pandoc

# 安装 LaTeX（选择下面任一方式）

# 方式 A：轻量级（推荐，约 100MB）
brew install basictex

# 方式 B：完整版（约 4GB，功能更全）
brew install mactex-no-gui

# 安装后更新 PATH
eval "$(/usr/libexec/path_helper)"
```

### 第 3 步：转换为 PDF

```bash
cd /Users/Apple/Downloads/专家系统

# 基础转换（最简单）
pandoc 设计说明文档.md -o 设计说明文档.pdf \
  --pdf-engine=xelatex \
  -V CJKmainfont="Songti SC"

# 完整参数转换（推荐）
pandoc 设计说明文档.md -o 动物识别专家系统_唐一璇_2022101068.pdf \
  --pdf-engine=xelatex \
  -V CJKmainfont="Songti SC" \
  -V geometry:margin=2.5cm \
  -V fontsize=12pt \
  -V linestretch=1.5 \
  --number-sections \
  --toc \
  --toc-depth=2 \
  --highlight-style=tango

# 高级参数（添加页眉页脚）
pandoc 设计说明文档.md -o 设计说明文档.pdf \
  --pdf-engine=xelatex \
  -V CJKmainfont="Songti SC" \
  -V geometry:margin=2.5cm \
  -V fontsize=12pt \
  -V linestretch=1.5 \
  --number-sections \
  --toc \
  -V pagestyle=headings \
  -M title="动物识别专家系统设计说明文档" \
  -M author="唐一璇 (2022101068)" \
  -M date="2025年12月"
```

### 第 4 步：检查 PDF

打开生成的 PDF 文件，检查：
- [ ] 封面信息正确（姓名、学号）
- [ ] 目录完整
- [ ] 章节编号正确
- [ ] 代码块格式良好
- [ ] 表格显示正常
- [ ] 中文字体无乱码

---

## 🎨 参数说明

### 基础参数

| 参数 | 说明 | 示例值 |
|------|------|--------|
| `--pdf-engine` | PDF 引擎 | `xelatex`（支持中文） |
| `-V CJKmainfont` | 中文字体 | `"Songti SC"`（宋体） |
| `-V fontsize` | 字体大小 | `12pt`, `11pt`, `10pt` |
| `-V geometry:margin` | 页边距 | `2.5cm`, `3cm` |
| `-V linestretch` | 行距 | `1.5`（1.5倍行距） |

### 进阶参数

| 参数 | 说明 |
|------|------|
| `--number-sections` | 自动给章节编号 |
| `--toc` | 生成目录 |
| `--toc-depth=2` | 目录深度（2=到二级标题） |
| `--highlight-style=tango` | 代码高亮样式 |
| `-M title="..."` | 文档标题 |
| `-M author="..."` | 作者 |
| `-M date="..."` | 日期 |

---

## 🔧 常见问题

### Q1: 提示找不到 xelatex

**解决**：
```bash
# 重新加载 PATH
eval "$(/usr/libexec/path_helper)"

# 或重启终端后再试
```

### Q2: 中文显示为方块

**解决**：更换中文字体

```bash
# 查看可用中文字体
fc-list :lang=zh

# 常见 Mac 中文字体：
# - Songti SC (宋体)
# - Heiti SC (黑体)
# - PingFang SC (苹方)
# - Kaiti SC (楷体)

# 使用黑体
pandoc 设计说明文档.md -o 设计说明文档.pdf \
  --pdf-engine=xelatex \
  -V CJKmainfont="Heiti SC"
```

### Q3: 表格超出页面宽度

**解决**：添加缩放参数

```bash
pandoc 设计说明文档.md -o 设计说明文档.pdf \
  --pdf-engine=xelatex \
  -V CJKmainfont="Songti SC" \
  -V geometry:margin=2cm \
  -V tables=true
```

### Q4: 代码块字体太大

**解决**：添加代码字体大小

```bash
pandoc 设计说明文档.md -o 设计说明文档.pdf \
  --pdf-engine=xelatex \
  -V CJKmainfont="Songti SC" \
  -V monofont="Monaco" \
  -V monofontoptions="Scale=0.8"
```

---

## 📋 完整转换脚本

创建一个转换脚本 `convert.sh`：

```bash
#!/bin/bash

# LaTeX 转 PDF 脚本
# 唐一璇 - 2022101068

echo "🔄 开始转换 Markdown 到 PDF..."

pandoc 设计说明文档.md \
  -o "动物识别专家系统_唐一璇_2022101068.pdf" \
  --pdf-engine=xelatex \
  -V CJKmainfont="Songti SC" \
  -V geometry:margin=2.5cm \
  -V fontsize=12pt \
  -V linestretch=1.5 \
  --number-sections \
  --toc \
  --toc-depth=2 \
  --highlight-style=tango \
  -M title="动物识别专家系统设计说明文档" \
  -M author="唐一璇 (2022101068)" \
  -M date="2025年12月"

if [ $? -eq 0 ]; then
    echo "✅ 转换成功！"
    echo "📄 输出文件：动物识别专家系统_唐一璇_2022101068.pdf"
    open "动物识别专家系统_唐一璇_2022101068.pdf"
else
    echo "❌ 转换失败，请检查错误信息"
fi
```

使用脚本：

```bash
chmod +x convert.sh
./convert.sh
```

---

## 🎯 推荐配置

**最佳实践**（适合课程作业提交）：

```bash
pandoc 设计说明文档.md \
  -o "动物识别专家系统_唐一璇_2022101068.pdf" \
  --pdf-engine=xelatex \
  -V CJKmainfont="Songti SC" \
  -V geometry:margin=2.5cm \
  -V fontsize=12pt \
  -V linestretch=1.5 \
  --number-sections \
  --toc \
  --toc-depth=2
```

**优点**：
- ✅ 符合学术规范（2.5cm 边距，12pt 字体）
- ✅ 自动编号和目录
- ✅ 1.5 倍行距（易读）
- ✅ 文件名包含姓名学号

---

## 📸 关于截图

当前文档使用的是**静态 PNG 截图**，完全兼容 LaTeX/PDF：

- ✅ `screenshots/01_homepage.png`
- ✅ `screenshots/03_forward_result_tiger.png`
- ✅ `screenshots/backward_reasoning_penguin_success.png`

**webp 动图**（`.webp` 文件）在 PDF 中无法显示，但：
- 可以保留在 GitHub 仓库供在线查看
- 答辩时可以现场演示
- 静态截图已足够展示系统功能

---

## ✅ 转换完成后的检查清单

- [ ] PDF 文件已生成
- [ ] 封面有姓名和学号（唐一璇、2022101068）
- [ ] GitHub 链接正确显示
- [ ] 目录完整（章节编号正确）
- [ ] 所有表格正常显示
- [ ] 代码块格式良好
- [ ] 截图清晰可见
- [ ] 中文无乱码
- [ ] 文件大小合理（预计 5-10MB）

---

**准备时间**：2025年12月  
**文档状态**：✅ 已优化，可直接转换
