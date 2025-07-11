<template>
  <div class="ui container">
    <h2 class="ui header">注册</h2>
    <form class="ui form segment" @submit.prevent="register">
      <div class="field">
        <input v-model="username" placeholder="用户名" required />
      </div>
      <div class="field">
        <input v-model="password" type="password" placeholder="密码" required />
      </div>
      <div class="field">
        <input v-model="email" placeholder="邮箱" />
      </div>
      <button class="ui primary button" :disabled="loading">注册</button>
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
const email = ref('');
const loading = ref(false);
const error = ref('');
const router = useRouter();
async function register() {
  loading.value = true;
  error.value = '';
  try {
    await axios.post('http://localhost:3000/api/register', { username: username.value, password: password.value, email: email.value });
    router.push('/login');
  } catch (e) {
    error.value = e.response?.data?.error || '注册失败';
  }
  loading.value = false;
}
</script> 