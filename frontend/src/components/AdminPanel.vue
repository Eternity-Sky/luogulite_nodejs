<template>
  <div class="ui container" style="margin-top:2em;">
    <div v-if="!user || !user.isAdmin" class="ui negative message">无权限，仅管理员可访问后台管理。</div>
    <div v-else class="ui grid">
      <div class="four wide column">
        <div class="ui vertical fluid tabular menu">
          <a class="item" :class="{active: tab==='announcement'}" @click="tab='announcement'">公告管理</a>
          <a class="item" :class="{active: tab==='user'}" @click="tab='user'">用户管理</a>
          <a class="item" :class="{active: tab==='problem'}" @click="tab='problem'">题库管理</a>
        </div>
      </div>
      <div class="twelve wide column">
        <div v-show="tab==='announcement'">
          <h3 class="ui header">公告管理</h3>
          <div class="ui form segment">
            <div class="field">
              <input v-model="newTitle" placeholder="公告标题" />
            </div>
            <div class="field">
              <textarea v-model="newContent" rows="3" placeholder="公告内容，支持Markdown和LaTeX"></textarea>
            </div>
            <button class="ui primary button" :disabled="announceLoading.value" @click="postAnnouncement">发布公告</button>
            <span v-if="announceLoading.value" class="ui text">发布中...</span>
            <span v-if="announceError.value" class="ui red text">{{ announceError.value }}</span>
          </div>
          <table class="ui celled table">
            <thead><tr><th>标题</th><th>内容</th><th>时间</th><th>操作</th></tr></thead>
            <tbody>
              <tr v-for="a in announcements" :key="a.id">
                <td>{{ a.title }}</td>
                <td><div v-html="renderMd(a.content)"></div></td>
                <td>{{ new Date(a.createdAt).toLocaleString() }}</td>
                <td><button class="ui red button mini" @click="deleteAnnouncement(a.id)">删除</button></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-show="tab==='user'">
          <h3 class="ui header">用户管理</h3>
          <table class="ui celled table">
            <thead><tr><th>ID</th><th>用户名</th><th>邮箱</th><th>管理员</th><th>操作</th></tr></thead>
            <tbody>
              <tr v-for="u in users" :key="u.id">
                <td>{{ u.id }}</td>
                <td>{{ u.username }}</td>
                <td>{{ u.email }}</td>
                <td><span :class="['ui label', u.isAdmin ? 'green' : '']">{{ u.isAdmin ? '是' : '否' }}</span></td>
                <td>
                  <button class="ui red button mini" @click="deleteUser(u.id)" :disabled="u.id===user.id">删除</button>
                  <button class="ui button mini" v-if="!u.isAdmin" @click="setAdmin(u.id)">设为管理员</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-show="tab==='problem'">
          <h3 class="ui header">题库管理</h3>
          <table class="ui celled table">
            <thead><tr><th>ID</th><th>标题</th><th>操作</th></tr></thead>
            <tbody>
              <tr v-for="p in problems" :key="p.id">
                <td>{{ p.id }}</td>
                <td>{{ p.title }}</td>
                <td>
                  <router-link :to="`/problems/${p.id}`" class="ui button mini">查看</router-link>
                  <button class="ui red button mini" @click="deleteProblem(p.id)">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import MarkdownIt from 'markdown-it';
import mk from 'markdown-it-katex';
import 'katex/dist/katex.min.css';
const md = MarkdownIt({ html: true, linkify: true, typographer: true }).use(mk);
function renderMd(text) { return md.render(text || ''); }
const user = ref(JSON.parse(localStorage.getItem('user') || 'null'));
const tab = ref('announcement');
const announcements = ref([]);
const newTitle = ref('');
const newContent = ref('');
const users = ref([]);
const problems = ref([]);
const announceLoading = ref(false);
const announceError = ref('');
async function fetchAll() {
  const [a, u, p] = await Promise.all([
    axios.get('http://localhost:3000/api/announcements'),
    axios.get('http://localhost:3000/api/users'),
    axios.get('http://localhost:3000/api/problems')
  ]);
  announcements.value = a.data;
  users.value = u.data;
  problems.value = p.data;
}
onMounted(fetchAll);
async function postAnnouncement() {
  if (!newTitle.value.trim() || !newContent.value.trim()) return;
  announceLoading.value = true;
  announceError.value = '';
  try {
    await axios.post('http://localhost:3000/api/announcements', {
      title: newTitle.value,
      content: newContent.value
    }, { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });
    newTitle.value = '';
    newContent.value = '';
    fetchAll();
  } catch (e) {
    announceError.value = e.response?.data?.error || '发布失败';
    alert(announceError.value);
  }
  announceLoading.value = false;
}
async function deleteAnnouncement(id) {
  await axios.delete(`http://localhost:3000/api/announcements/${id}`, { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });
  fetchAll();
}
async function deleteUser(id) {
  await axios.delete(`http://localhost:3000/api/users/${id}`, { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });
  fetchAll();
}
async function setAdmin(id) {
  await axios.put(`http://localhost:3000/api/users/${id}`, { isAdmin: true }, { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });
  fetchAll();
}
async function deleteProblem(id) {
  await axios.delete(`http://localhost:3000/api/problems/${id}`, { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });
  fetchAll();
}
</script> 