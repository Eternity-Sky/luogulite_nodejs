<template>
  <div class="ui container">
    <h2 class="ui header">用户信息</h2>
    <form class="ui form segment" @submit.prevent="addUser">
      <div class="field">
        <input v-model="newUser.username" placeholder="用户名" required />
      </div>
      <div class="field">
        <input v-model="newUser.password" type="password" placeholder="密码" required />
      </div>
      <div class="field">
        <input v-model="newUser.email" placeholder="邮箱" />
      </div>
      <button class="ui primary button" :disabled="adding">新增用户</button>
      <span v-if="addError" class="ui red text">{{ addError }}</span>
    </form>
    <div class="ui segment" v-if="loading">Loading...</div>
    <div v-else-if="user">
      <div><b>ID：</b>{{ user.id }}</div>
      <div><b>用户名：</b>{{ user.username }}</div>
      <div><b>邮箱：</b>{{ user.email }}</div>
      <button class="ui red button" @click="deleteUser">删除用户</button>
    </div>
    <div v-else class="ui segment">用户不存在</div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
const route = useRoute();
const router = useRouter();
const user = ref(null);
const loading = ref(true);
const newUser = ref({ username: '', password: '', email: '' });
const adding = ref(false);
const addError = ref('');
async function fetchUser() {
  try {
    const res = await axios.get(`http://localhost:3000/api/users/${route.params.id}`);
    user.value = res.data;
  } catch {
    user.value = null;
  }
  loading.value = false;
}
onMounted(fetchUser);
async function addUser() {
  adding.value = true;
  addError.value = '';
  try {
    await axios.post('http://localhost:3000/api/users', newUser.value);
    newUser.value = { username: '', password: '', email: '' };
    fetchUser();
  } catch (e) {
    addError.value = '新增失败';
  }
  adding.value = false;
}
async function deleteUser() {
  if (!confirm('确定删除？')) return;
  await axios.delete(`http://localhost:3000/api/users/${user.value.id}`);
  router.push('/');
}
</script> 