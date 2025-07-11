# LuoguLite-Node OJ 复刻版

## 项目简介

本项目为原 PHP+Vue OJ 系统的 Node.js + Vue3 + Semantic UI 复刻版，支持题库、评测、题解、公告、后台管理等完整 OJ 功能。

---

## 目录结构

```
luogulite-node/
  backend/         # 后端 Node.js 代码（如有）
  frontend/        # 前端 Vue3 代码
  models/          # Sequelize 模型
  index.js         # 主后端入口
  README.md        # 本说明文档
```

---

## 环境依赖

- Node.js 18+（推荐 LTS 版本）
- MySQL 5.7+（需支持 JSON 字段）
- 推荐使用 Chrome 浏览器

### 安装依赖

```bash
# 后端依赖
cd luogulite-node
npm install

# 前端依赖
cd frontend
npm install
```

---

## 数据库初始化

1. 启动 MySQL，创建数据库（如 `oj`）：
   ```sql
   CREATE DATABASE oj DEFAULT CHARSET utf8mb4;
   USE oj;
   ```
2. 执行以下建表 SQL（如已自动同步可跳过）：
   ```sql
   -- 用户表
   CREATE TABLE IF NOT EXISTS Users (
     id INT AUTO_INCREMENT PRIMARY KEY,
     username VARCHAR(255) NOT NULL UNIQUE,
     password VARCHAR(255) NOT NULL,
     email VARCHAR(255),
     isAdmin TINYINT(1) NOT NULL DEFAULT 0,
     createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
     updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   );
   -- 题目表
   CREATE TABLE IF NOT EXISTS Problems (
     id INT AUTO_INCREMENT PRIMARY KEY,
     title VARCHAR(1024) NOT NULL,
     description TEXT NOT NULL,
     inputFormat TEXT NOT NULL,
     outputFormat TEXT NOT NULL,
     sampleInput TEXT,
     sampleOutput TEXT,
     hint TEXT,
     sampleTestcases JSON,
     testcaseInfo JSON,
     providerId INT,
     createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
     updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   );
   -- 评测记录表
   CREATE TABLE IF NOT EXISTS JudgeRecords (
     id INT AUTO_INCREMENT PRIMARY KEY,
     userId INT NOT NULL,
     problemId INT NOT NULL,
     code TEXT,
     language VARCHAR(32),
     score INT,
     status VARCHAR(16) NOT NULL,
     detail JSON,
     createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
     updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   );
   -- 题解表
   CREATE TABLE IF NOT EXISTS Solutions (
     id INT AUTO_INCREMENT PRIMARY KEY,
     problemId INT NOT NULL,
     userId INT NOT NULL,
     content TEXT NOT NULL,
     likeCount INT NOT NULL DEFAULT 0,
     createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
     updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   );
   -- 公告表
   CREATE TABLE IF NOT EXISTS Announcements (
     id INT AUTO_INCREMENT PRIMARY KEY,
     title VARCHAR(255) NOT NULL,
     content TEXT NOT NULL,
     userId INT NOT NULL,
     createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
     updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   );
   ```

3. 配置数据库连接（`.env` 文件）：
   ```env
   DB_NAME=oj
   DB_USER=root
   DB_PASS=你的密码
   DB_HOST=localhost
   JWT_SECRET=luogulite_secret
   ```

---

## 启动后端

```bash
cd luogulite-node
node index.js
```
默认端口：3000

---

## 启动前端

```bash
cd luogulite-node/frontend
npm run dev
```
默认端口：5173

---

## 管理员设置

- 首个注册用户自动为管理员。
- 如需手动设置管理员：
  ```sql
  UPDATE Users SET isAdmin=1 WHERE username='你的管理员用户名';
  ```
- 管理员可访问首页“后台管理”按钮，集中管理公告、用户、题库。

---

## 常见问题

- **登录后无权限/不是管理员？**
  - 退出登录，重新登录，确保 localStorage.user 信息已刷新。
  - 检查数据库 isAdmin 字段。
- **LaTeX 不渲染？**
  - 确保已全局引入 `katex/dist/katex.min.css`，并用 `$...$` 或 `$$...$$` 包裹公式。
- **接口 404/500？**
  - 检查后端服务是否已重启，数据库表结构是否同步。

---

## 功能说明

- 题库：浏览、增删改查题目，支持样例、测试点、Markdown/LaTeX 描述
- 评测：支持代码提交、评测记录、评测详情
- 题解：题目下可发布题解，支持 Markdown/LaTeX、点赞、删除
- 公告：首页公告区展示，后台管理可发布/删除，支持 Markdown/LaTeX
- 用户：注册、登录、个人主页、权限管理
- 后台管理：公告、用户、题库集中管理，仅管理员可见

---

## 其它

- 如需扩展功能（如题目标签、导入导出、判题沙箱等），可在 issues 或 PR 中提出。
- 前端样式基于 Semantic UI，支持自定义美化。

---

如有问题欢迎反馈！ 