const express = require('express');
const cors = require('cors');
const { Sequelize } = require('sequelize');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const JWT_SECRET = process.env.JWT_SECRET || 'luogulite_secret';

const app = express();
app.use(cors());
app.use(express.json());

// 数据库连接
const sequelize = new Sequelize(
  process.env.DB_NAME || 'luogulite',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// 加载模型
const User = require('./models/user')(sequelize);
const Problem = require('./models/problem')(sequelize);
const JudgeRecord = require('./models/judgerecord')(sequelize);
const TestcaseInfo = require('./models/testcaseinfo')(sequelize);
const Solution = require('./models/solution')(sequelize);
const Announcement = require('./models/announcement')(sequelize);

// 关联
Problem.belongsTo(User, { as: 'provider', foreignKey: 'providerId' });
JudgeRecord.belongsTo(User, { foreignKey: 'userId' });
JudgeRecord.belongsTo(Problem, { foreignKey: 'problemId' });
Solution.belongsTo(User, { foreignKey: 'userId' });
Solution.belongsTo(Problem, { foreignKey: 'problemId' });
Announcement.belongsTo(User, { foreignKey: 'userId' });

// 数据库连接初始化
let dbInitialized = false;
async function initializeDatabase() {
  if (dbInitialized) return;
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');
    await sequelize.sync({ alter: true });
    dbInitialized = true;
  } catch (err) {
    console.error('数据库连接失败:', err);
    throw err;
  }
}

// 确保数据库连接的中间件
app.use(async (req, res, next) => {
  try {
    await initializeDatabase();
    next();
  } catch (err) {
    res.status(500).json({ error: '数据库连接失败' });
  }
});

// API 路由示例
app.get('/api/problems', async (req, res) => {
  const problems = await Problem.findAll();
  res.json(problems);
});

app.get('/api/users', async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

app.get('/api/judgerecords', async (req, res) => {
  const records = await JudgeRecord.findAll();
  res.json(records);
});

// 获取单个题目
app.get('/api/problems/:id', async (req, res) => {
  const problem = await Problem.findByPk(req.params.id);
  if (!problem) return res.status(404).json({ error: 'Not found' });
  res.json(problem);
});
// 题目相关接口加 auth, adminOnly
app.post('/api/problems', auth, adminOnly, async (req, res) => {
  const p = await Problem.create(req.body);
  res.json(p);
});
app.put('/api/problems/:id', auth, adminOnly, async (req, res) => {
  const p = await Problem.findByPk(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  await p.update(req.body);
  res.json(p);
});
app.delete('/api/problems/:id', auth, adminOnly, async (req, res) => {
  const p = await Problem.findByPk(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  // 先删依赖表
  await JudgeRecord.destroy({ where: { problemId: p.id } });
  await Solution.destroy({ where: { problemId: p.id } });
  // 再删题目
  await p.destroy();
  res.json({ success: true });
});
// 获取单个用户
app.get('/api/users/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json(user);
});
// 用户相关接口加 auth, adminOnly
app.post('/api/users', auth, adminOnly, async (req, res) => {
  const u = await User.create(req.body);
  res.json(u);
});
app.delete('/api/users/:id', auth, adminOnly, async (req, res) => {
  const u = await User.findByPk(req.params.id);
  if (!u) return res.status(404).json({ error: 'Not found' });
  // 先删依赖表
  await JudgeRecord.destroy({ where: { userId: u.id } });
  await Solution.destroy({ where: { userId: u.id } });
  // 再删用户
  await u.destroy();
  res.json({ success: true });
});
// 获取评测记录（可按用户/题目筛选）
app.get('/api/judgerecords', async (req, res) => {
  const where = {};
  if (req.query.userId) where.userId = req.query.userId;
  if (req.query.problemId) where.problemId = req.query.problemId;
  const records = await JudgeRecord.findAll({ where });
  res.json(records);
});
// 获取单条评测记录详情
app.get('/api/judgerecords/:id', async (req, res) => {
  const record = await JudgeRecord.findByPk(req.params.id);
  if (!record) return res.status(404).json({ error: 'Not found' });
  res.json(record);
});
// 新增评测记录（仅需登录）
app.post('/api/judgerecords', auth, async (req, res) => {
  const { problemId, code, language } = req.body;
  const problem = await Problem.findByPk(problemId);
  if (!problem) return res.status(404).json({ error: '题目不存在' });
  let testcaseInfo = problem.testcaseInfo || [];
  if (typeof testcaseInfo === 'string') {
    try { testcaseInfo = JSON.parse(testcaseInfo); } catch { testcaseInfo = []; }
  }
  // 模拟评测：假设用户输出等于标准输出即通过
  const detail = testcaseInfo.map(tc => ({
    input: tc.input,
    expectedOutput: tc.output,
    userOutput: tc.output, // 模拟：假设用户输出总是正确
    score: tc.score,
    passed: true
  }));
  const totalScore = detail.reduce((sum, tc) => sum + (tc.passed ? tc.score : 0), 0);
  const allPassed = detail.every(tc => tc.passed);
  const status = allPassed ? 'AC' : 'UN_AC';
  const r = await JudgeRecord.create({
    userId: req.user.id,
    problemId,
    code,
    language,
    score: totalScore,
    detail,
    status
  });
  res.json(r);
});

// 题解相关接口
// 获取题解列表（可按题目筛选）
app.get('/api/solutions', async (req, res) => {
  const where = {};
  if (req.query.problemId) where.problemId = req.query.problemId;
  const solutions = await Solution.findAll({ where, order: [['createdAt', 'DESC']] });
  res.json(solutions);
});
// 发布题解
app.post('/api/solutions', auth, async (req, res) => {
  const { problemId, content } = req.body;
  if (!problemId || !content) return res.status(400).json({ error: '参数缺失' });
  const s = await Solution.create({ problemId, userId: req.user.id, content });
  res.json(s);
});
// 删除题解（仅作者或管理员）
app.delete('/api/solutions/:id', auth, async (req, res) => {
  const s = await Solution.findByPk(req.params.id);
  if (!s) return res.status(404).json({ error: 'Not found' });
  if (s.userId !== req.user.id && !req.user.isAdmin) return res.status(403).json({ error: '无权限' });
  await s.destroy();
  res.json({ success: true });
});
// 点赞题解
app.post('/api/solutions/:id/like', auth, async (req, res) => {
  const s = await Solution.findByPk(req.params.id);
  if (!s) return res.status(404).json({ error: 'Not found' });
  s.likeCount += 1;
  await s.save();
  res.json({ likeCount: s.likeCount });
});

// 公告相关接口
// 获取所有公告
app.get('/api/announcements', async (req, res) => {
  const list = await Announcement.findAll({ order: [['createdAt', 'DESC']] });
  res.json(list);
});
// 发布公告（仅管理员）
app.post('/api/announcements', auth, adminOnly, async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) return res.status(400).json({ error: '参数缺失' });
  const a = await Announcement.create({ title, content, userId: req.user.id });
  res.json(a);
});
// 删除公告（仅管理员）
app.delete('/api/announcements/:id', auth, adminOnly, async (req, res) => {
  const a = await Announcement.findByPk(req.params.id);
  if (!a) return res.status(404).json({ error: 'Not found' });
  await a.destroy();
  res.json({ success: true });
});

// 注册
app.post('/api/register', async (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password) return res.status(400).json({ error: '用户名和密码必填' });
  const exists = await User.findOne({ where: { username } });
  if (exists) return res.status(400).json({ error: '用户名已存在' });
  const hash = await bcrypt.hash(password, 10);
  // 第一个用户自动 isAdmin
  const userCount = await User.count();
  const user = await User.create({ username, password: hash, email, isAdmin: userCount === 0 });
  res.json({ id: user.id, username: user.username, isAdmin: user.isAdmin });
});
// 登录
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username } });
  if (!user) return res.status(400).json({ error: '用户不存在' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ error: '密码错误' });
  const token = jwt.sign({ id: user.id, username: user.username, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});
// JWT 校验中间件
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: '未登录' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: '无效token' });
  }
}
// 管理员校验中间件
function adminOnly(req, res, next) {
  if (!req.user || !req.user.isAdmin) return res.status(403).json({ error: '仅限管理员操作' });
  next();
}
// 获取当前用户
app.get('/api/me', auth, async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) return res.status(404).json({ error: '未找到用户' });
  res.json({ id: user.id, username: user.username, email: user.email, isAdmin: user.isAdmin });
});
// 登出（前端只需清除token即可）
app.post('/api/logout', (req, res) => {
  res.json({ success: true });
});

// 全局错误处理中间件，放在所有路由后面
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ error: err.message || '服务器错误', detail: err.stack });
});

// 导出app供Vercel使用
module.exports = app; 