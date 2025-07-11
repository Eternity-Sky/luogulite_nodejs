<script setup>
import 'semantic-ui-css/semantic.min.css';
import { ref, onMounted, watch, provide } from 'vue';
import axios from 'axios';
import { useRouter, useRoute } from 'vue-router';
const user = ref(null);
const router = useRouter();
const route = useRoute();
function getToken() {
  return localStorage.getItem('token');
}
async function fetchUser() {
  const token = getToken();
  if (!token) { user.value = null; return; }
  try {
    const res = await axios.get('http://localhost:3000/api/me', { headers: { Authorization: 'Bearer ' + token } });
    user.value = res.data;
  } catch {
    user.value = null;
  }
}
onMounted(fetchUser);
watch(() => route.fullPath, fetchUser);
async function logout() {
  localStorage.removeItem('token');
  user.value = null;
  router.push('/login');
  fetchUser();
}
function onLoginSuccess() {
  fetchUser();
}
provide('user', user);
</script>

<template>
  <div>
    <div class="ui fixed menu">
      <div class="ui container">
        <router-link to="/" class="header item">LuoguLite</router-link>
        <router-link to="/" class="item">首页</router-link>
        <router-link to="/problems" class="item">题库</router-link>
        <router-link to="/records" class="item">评测记录</router-link>
        <div class="right menu">
          <template v-if="user">
            <span class="item">你好，{{ user.username }}</span>
            <a class="item" href="#" @click.prevent="logout">登出</a>
          </template>
          <template v-else>
            <router-link to="/login" class="item">登录</router-link>
            <router-link to="/register" class="item">注册</router-link>
          </template>
        </div>
      </div>
    </div>
    <div class="main container" style="margin-top:6em">
      <router-view @login-success="onLoginSuccess" />
    </div>
    <div class="ui inverted vertical footer segment" style="margin:3em 0 0;padding:3em 0;">
      <div class="ui center aligned container">
        <p>Powered by LuoguLite</p>
        <div class="ui inverted section divider"></div>
        <div class="ui horizontal inverted small divided link list">
          <a class="item" href="#">Site Map</a>
          <a class="item" href="https://github.com/luogu-dev/luogulite">GitHub</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
