<template>
  <div class="ui container">
    <h2 class="ui header">登录</h2>
    <form class="ui form segment" @submit.prevent="login">
      <div class="field">
        <input v-model="username" placeholder="用户名" required />
      </div>
      <div class="field">
        <input v-model="password" type="password" placeholder="密码" required />
      </div>
      <button class="ui primary button" :disabled="loading">登录</button>
      <span v-if="error" class="ui red text">{{ error }}</span>
    </form>
  </div>
</template>
<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
const username = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');
const router = useRouter();
async function login() {
  loading.value = true;
  error.value = '';
  try {
    const res = await axios.post('http://localhost:3000/api/login', { username: username.value, password: password.value });
    localStorage.setItem('token', res.data.token);
    // 登录后获取用户信息并写入 localStorage
    const me = await axios.get('http://localhost:3000/api/me', { headers: { Authorization: 'Bearer ' + res.data.token } });
    localStorage.setItem('user', JSON.stringify(me.data));
    router.push('/');
  } catch (e) {
    error.value = e.response?.data?.error || '登录失败';
  }
  loading.value = false;
}
</script> 