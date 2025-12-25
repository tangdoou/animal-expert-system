# GitHub 上传指南

**仓库**：https://github.com/tangdoou/animal-expert-system  
**学生**：唐一璇 (2022101068)

---

## 📦 即将上传的文件

### 新增文件

1. **设计文档**
   - `设计说明文档.md` - 完整的设计说明文档
   - `提交指南.md` - 作业提交准备清单
   - `LaTeX转PDF指南.md` - PDF 转换指南
   - `动图使用说明.md` - 动图处理说明

2. **参考文档**（.gitignore 已修改为包含）
   - `书.md` - 教材内容参考
   - `课设.md` - 课设要求
   - `需求.md` - 需求说明

3. **截图文件**（55个文件）
   - 系统界面截图（PNG）
   - **动图演示**（WebP）：
     - `screenshots/forward_reasoning_test.webp` - 正向推理演示
     - `screenshots/backward_reasoning_test.webp` - 反向推理演示
     - `screenshots/full_backward_test.webp` - 完整反向推理

4. **更新文件**
   - `README.md` - 已添加个人信息和 GitHub 链接
   - `.gitignore` - 已修改为包含参考文档

---

## 🚀 快速上传（推荐）

```bash
cd /Users/Apple/Downloads/专家系统

# 添加所有文件
git add .

# 提交
git commit -m "docs: 添加完整设计文档、截图和演示视频

- 添加设计说明文档（包含个人信息和GitHub链接）
- 添加LaTeX转PDF指南和提交指南
- 添加所有功能截图（55个文件）
- 添加3个WebP格式的演示动图
- 更新README添加作者信息
- 完善.gitignore配置

作者：唐一璇 (2022101068)"

# 推送到 GitHub
git push origin main
```

---

## 📝 分步骤操作（详细）

### 第 1 步：添加文件

```bash
cd /Users/Apple/Downloads/专家系统

# 添加设计文档
git add 设计说明文档.md
git add 提交指南.md
git add LaTeX转PDF指南.md
git add 动图使用说明.md

# 添加参考文档
git add 书.md 课设.md 需求.md

# 添加所有截图（包括webp动图）
git add screenshots/

# 添加更新的文件
git add README.md
git add .gitignore

# 查看将要提交的文件
git status
```

### 第 2 步：提交

```bash
git commit -m "docs: 添加完整设计文档、截图和演示视频

- 添加设计说明文档（包含个人信息和GitHub链接）
- 添加LaTeX转PDF指南和提交指南
- 添加所有功能截图（55个文件）
- 添加3个WebP格式的演示动图
- 更新README添加作者信息
- 完善.gitignore配置

作者：唐一璇 (2022101068)"
```

### 第 3 步：推送

```bash
git push origin main
```

如果需要输入用户名和密码，使用：
- **用户名**：你的 GitHub 用户名
- **密码**：GitHub Personal Access Token（不是账户密码）

---

## 🎬 关于 WebP 动图

### 3个演示视频

| 文件 | 大小 | 说明 |
|------|------|------|
| `forward_reasoning_test.webp` | ~1.8 MB | 正向推理完整演示 |
| `backward_reasoning_test.webp` | ~11.2 MB | 反向推理完整演示 |
| `full_backward_test.webp` | ~1.7 MB | 完整反向推理流程 |

### 在 GitHub 上查看

上传后，在 GitHub 仓库的 README.md 中可以这样展示：

```markdown
## 📸 系统演示

### 正向推理演示

![正向推理](screenshots/forward_reasoning_test.webp)

### 反向推理演示

![反向推理](screenshots/backward_reasoning_test.webp)
```

GitHub 支持直接播放 WebP 动图！

---

## ⚠️ 注意事项

### 大文件警告

`backward_reasoning_test.webp` 文件较大（~11.2 MB），如果 git 报错：

```bash
# 使用 Git LFS（大文件存储）
git lfs install
git lfs track "*.webp"
git add .gitattributes
git commit -m "chore: 配置 Git LFS 管理大文件"
git push origin main
```

### 如果遇到推送失败

```bash
# 先拉取远程更新
git pull origin main --rebase

# 再推送
git push origin main
```

---

## ✅ 上传完成检查清单

上传后访问 GitHub 仓库检查：

- [ ] 设计说明文档可见
- [ ] README.md 显示正确（包含个人信息）
- [ ] screenshots 文件夹包含所有截图
- [ ] WebP 动图可以在线播放
- [ ] 提交历史中有你的提交记录

---

## 🔗 推荐的 README 更新

上传后，可以进一步优化 GitHub 的 README.md，在正向推理部分添加动图：

在 README.md 的"测试示例"部分添加：

```markdown
### 示例演示（动图）

#### 正向推理演示

![正向推理演示](screenshots/forward_reasoning_test.webp)

*完整演示：从选择特征到识别出"虎"的整个推理过程*

#### 反向推理演示

![反向推理演示](screenshots/full_backward_test.webp)

*完整演示：从选择目标动物到验证成功的完整流程*
```

---

## 🎯 一键上传脚本

创建 `upload.sh` 脚本：

```bash
#!/bin/bash

echo "🚀 准备上传到 GitHub..."

# 添加所有文件
git add .

# 查看状态
echo "\n📋 待提交的文件："
git status --short

# 确认
read -p "确认提交并推送？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    # 提交
    git commit -m "docs: 添加完整设计文档、截图和演示视频

- 添加设计说明文档（包含个人信息和GitHub链接）
- 添加LaTeX转PDF指南和提交指南
- 添加所有功能截图（55个文件）
- 添加3个WebP格式的演示动图
- 更新README添加作者信息

作者：唐一璇 (2022101068)"
    
    # 推送
    git push origin main
    
    echo "✅ 上传完成！"
    echo "🔗 查看仓库：https://github.com/tangdoou/animal-expert-system"
else
    echo "❌ 已取消"
fi
```

使用：
```bash
chmod +x upload.sh
./upload.sh
```

---

**准备时间**：2025年12月26日  
**状态**：✅ 准备就绪，可以上传
