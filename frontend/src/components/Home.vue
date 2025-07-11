<template>
  <div class="ui container" style="margin-top:2em;">
    <div v-if="loading">
      <div class="ui active inverted dimmer"><div class="ui loader"></div></div>
    </div>
    <div v-else>
      <!-- 管理员后台管理入口保留 -->
      <div v-if="user && user.isAdmin" style="margin-bottom:1em;">
        <router-link to="/admin" class="ui blue button">后台管理</router-link>
      </div>
      <div v-if="user" style="margin-bottom:1em;">
        <button class="ui button primary" @click="goMyProfile">我的主页</button>
      </div>
      <div class="ui segment" v-if="announcements.length">
        <h3 class="ui header">公告</h3>
        <div class="ui feed">
          <div class="event" v-for="a in announcements" :key="a.id">
            <div class="content">
              <div class="summary">
                <b>{{ a.title }}</b>
                <span class="date" style="margin-left:1em;">{{ new Date(a.createdAt).toLocaleString() }}</span>
              </div>
              <div class="extra text" v-html="renderMd(a.content)"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="ui segment">
        <h2 class="ui header">欢迎来到 OJ 系统！</h2>
        <p>请在左侧导航栏选择功能。</p>
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
import { useRouter } from 'vue-router';
const router = useRouter();
const md = MarkdownIt({ html: true, linkify: true, typographer: true }).use(mk);
function renderMd(text) {
  return md.render(text || '');
}
const announcements = ref([]);
const loading = ref(true);
const user = ref(null);
const newTitle = ref('');
const newContent = ref('');
async function fetchAnnouncements() {
  const res = await axios.get('http://localhost:3000/api/announcements');
  announcements.value = res.data;
  loading.value = false;
}
async function postAnnouncement() {
  if (!newTitle.value.trim() || !newContent.value.trim()) return;
  await axios.post('http://localhost:3000/api/announcements', {
    title: newTitle.value,
    content: newContent.value
  }, { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });
  newTitle.value = '';
  newContent.value = '';
  fetchAnnouncements();
}
async function deleteAnnouncement(id) {
  await axios.delete(`http://localhost:3000/api/announcements/${id}`, { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });
  fetchAnnouncements();
}
onMounted(fetchAnnouncements);
onMounted(() => {
  const u = localStorage.getItem('user');
  if (u) user.value = JSON.parse(u);
});
function goMyProfile() {
  if (user.value) router.push(`/users/${user.value.id}`);
}
</script> 