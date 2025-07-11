<template>
  <div class="ui container" style="margin-top:2em;">
    <div v-if="loading">
      <div class="ui active inverted dimmer"><div class="ui loader"></div></div>
    </div>
    <div v-else-if="problem">
      <h2 class="ui header">{{ problem.title }}</h2>
      <div class="ui top attached tabular menu">
        <a class="item" :class="{active: tab==='desc'}" @click="tab='desc'">题目描述</a>
        <a class="item" :class="{active: tab==='solutions'}" @click="tab='solutions'">题解</a>
      </div>
      <div class="ui bottom attached segment" v-show="tab==='desc'">
        <div class="ui raised segment">
          <div class="ui divider"></div>
          <div class="ui segments">
            <div class="ui segment">
              <h4 class="ui dividing header">题目描述</h4>
              <div v-html="renderMd(problem.description)"></div>
              <h4 class="ui dividing header">输入格式</h4>
              <div v-html="renderMd(problem.inputFormat)"></div>
              <h4 class="ui dividing header">输出格式</h4>
              <div v-html="renderMd(problem.outputFormat)"></div>
              <h4 class="ui dividing header">样例输入</h4>
              <pre>{{ problem.sampleInput }}</pre>
              <h4 class="ui dividing header">样例输出</h4>
              <pre>{{ problem.sampleOutput }}</pre>
              <h4 class="ui dividing header">提示</h4>
              <div v-html="renderMd(problem.hint)"></div>
            </div>
            <div class="ui segment" v-if="problem.testcaseInfo && problem.testcaseInfo.length">
              <h4 class="ui dividing header">测试点信息</h4>
              <table class="ui celled table">
                <thead>
                  <tr><th>序号</th><th>输入</th><th>输出</th><th>分值</th></tr>
                </thead>
                <tbody>
                  <tr v-for="(tc, idx) in problem.testcaseInfo" :key="idx">
                    <td>{{ idx + 1 }}</td>
                    <td><pre>{{ tc.input }}</pre></td>
                    <td><pre>{{ tc.output }}</pre></td>
                    <td>{{ tc.score }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div class="ui bottom attached segment" v-show="tab==='solutions'">
        <div v-if="user" class="ui form">
          <div class="field">
            <textarea v-model="solutionContent" rows="3" placeholder="写下你的题解..." />
          </div>
          <button class="ui primary button" @click="submitSolution">发布题解</button>
        </div>
        <div class="ui divider"></div>
        <div v-if="solutions.length">
          <div class="ui comments">
            <div class="comment" v-for="s in solutions" :key="s.id">
              <div class="content">
                <span class="author">用户 #{{ s.userId }}</span>
                <div class="metadata">
                  <span class="date">{{ new Date(s.createdAt).toLocaleString() }}</span>
                  <span class="like-count" style="margin-left:1em;">👍 {{ s.likeCount }}</span>
                </div>
                <div class="text" style="white-space:pre-wrap;" v-html="renderMd(s.content)"></div>
                <div class="actions">
                  <a class="reply" @click="likeSolution(s.id)">点赞</a>
                  <a class="reply" v-if="user && (user.id===s.userId || user.isAdmin)" @click="deleteSolution(s.id)">删除</a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="ui message">暂无题解，快来首发吧！</div>
      </div>
    </div>
    <div v-else class="ui message">题目不存在</div>
  </div>
</template>
<script setup>
import { ref, onMounted, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import MarkdownIt from 'markdown-it';
import mk from 'markdown-it-katex';
import 'katex/dist/katex.min.css';
const md = MarkdownIt({ html: true, linkify: true, typographer: true }).use(mk);
function renderMd(text) {
  return md.render(text || '');
}
const route = useRoute();
const router = useRouter();
const problem = ref(null);
const editing = ref(false);
const editData = ref({});
const updating = ref(false);
const editError = ref('');
const user = inject('user');
const lang = ref('cpp');
const code = ref('');
const submitting = ref(false);
const submitMsg = ref('');
const submitSuccess = ref(false);
const loading = ref(true);
const tab = ref('desc');
const solutions = ref([]);
const solutionContent = ref('');
async function fetchProblem() {
  const res = await axios.get(`http://localhost:3000/api/problems/${route.params.id}`);
  problem.value = res.data;
  loading.value = false;
}
async function fetchSolutions() {
  const res = await axios.get(`http://localhost:3000/api/solutions?problemId=${route.params.id}`);
  solutions.value = res.data;
}
async function submitSolution() {
  if (!solutionContent.value.trim()) return;
  await axios.post('http://localhost:3000/api/solutions', {
    problemId: problem.value.id,
    content: solutionContent.value
  }, { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });
  solutionContent.value = '';
  fetchSolutions();
}
async function deleteSolution(id) {
  await axios.delete(`http://localhost:3000/api/solutions/${id}`, { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });
  fetchSolutions();
}
async function likeSolution(id) {
  await axios.post(`http://localhost:3000/api/solutions/${id}/like`, {}, { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });
  fetchSolutions();
}
onMounted(() => { fetchProblem(); fetchSolutions(); });
function startEdit() {
  editing.value = true;
  editData.value = { ...problem.value };
}
async function updateProblem() {
  updating.value = true;
  editError.value = '';
  try {
    await axios.put(`http://localhost:3000/api/problems/${problem.value.id}`, editData.value, { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });
    editing.value = false;
    fetchProblem();
  } catch (e) {
    editError.value = '保存失败';
  }
  updating.value = false;
}
async function deleteProblem() {
  if (!confirm('确定删除？')) return;
  await axios.delete(`http://localhost:3000/api/problems/${problem.value.id}`, { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });
  router.push('/problems');
}
async function submitCode() {
  submitting.value = true;
  submitMsg.value = '';
  submitSuccess.value = false;
  try {
    // 模拟评测，直接生成评测记录
    await axios.post('http://localhost:3000/api/judgerecords', {
      userId: user.value.id,
      problemId: problem.value.id,
      status: 'AC', // 可随机/模拟
      score: 100
    }, { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });
    submitMsg.value = '提交成功，评测通过！';
    submitSuccess.value = true;
    code.value = '';
  } catch (e) {
    submitMsg.value = '提交失败';
    submitSuccess.value = false;
  }
  submitting.value = false;
}
</script> 