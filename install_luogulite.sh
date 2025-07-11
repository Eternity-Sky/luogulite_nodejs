#!/bin/bash
# LuoguLite-Node OJ 一键全自动安装脚本
# 适用环境：Ubuntu/CentOS/macOS，需有sudo权限
# 项目地址：https://github.com/Eternity-Sky/luogulite_nodejs
set -e

echo "==== 1. 安装 Node.js（如未安装） ===="
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi
node -v

echo "==== 2. 安装 MySQL（如未安装） ===="
if ! command -v mysql >/dev/null 2>&1; then
  sudo apt-get update
  sudo apt-get install -y mysql-server
  sudo systemctl start mysql
  sudo systemctl enable mysql
fi
mysql --version

echo "==== 3. 克隆项目 ===="
if [ ! -d "luogulite_nodejs" ]; then
  git clone https://github.com/Eternity-Sky/luogulite_nodejs.git
fi
cd luogulite_nodejs

echo "==== 4. 安装后端依赖 ===="
npm install

echo "==== 5. 安装前端依赖 ===="
cd frontend
npm install
cd ..

echo "==== 6. 初始化数据库 ===="
# 读取或设置数据库密码
DB_PASS=${DB_PASS:-"root"}
DB_USER=${DB_USER:-"root"}
DB_NAME=${DB_NAME:-"oj"}
DB_HOST=${DB_HOST:-"localhost"}

# 创建数据库和表
mysql -u$DB_USER -p$DB_PASS -e "CREATE DATABASE IF NOT EXISTS $DB_NAME DEFAULT CHARSET utf8mb4;"
mysql -u$DB_USER -p$DB_PASS $DB_NAME < <(cat <<EOF
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
EOF
)

echo "==== 7. 配置 .env 环境变量 ===="
cat > .env <<EOF
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASS=$DB_PASS
DB_HOST=$DB_HOST
JWT_SECRET=luogulite_secret
EOF

echo "==== 8. 启动后端服务 ===="
nohup node index.js > backend.log 2>&1 &

echo "==== 9. 启动前端服务 ===="
cd frontend
nohup npm run dev > frontend.log 2>&1 &

echo "==== 部署完成！===="
echo "前端：http://localhost:5173"
echo "后端：http://localhost:3000"
echo "请用浏览器访问前端地址注册管理员账号。" 