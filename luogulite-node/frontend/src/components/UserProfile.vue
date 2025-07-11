<template>
  <div class="ui container" style="margin-top:2em;">
    <div v-if="loading">
      <div class="ui active inverted dimmer"><div class="ui loader"></div></div>
    </div>
    <div v-else-if="user">
      <h2 class="ui header">用户 #{{ user.id }}：{{ user.username }}</h2>
      <div class="ui segment">
        <p><b>邮箱：</b>{{ user.email || '未填写' }}</p>
        <p><b>注册时间：</b>{{ new Date(user.createdAt).toLocaleString() }}</p>
        <p><b>管理员：</b><span :class="['ui label', user.isAdmin ? 'green' : '']">{{ user.isAdmin ? '是' : '否' }}</span></p>
      </div>
      <div class="ui top attached tabular menu">
        <a class="item" :class="{active: tab==='records'}" @click="tab='records'">评测记录</a>
        <a class="item" :class="{active: tab==='solutions'}" @click="tab='solutions'">题解</a>
      </div>
      <div class="ui bottom attached segment" v-show="tab==='records'">
        <table class="ui celled table">
          <thead>
            <tr><th>ID</th><th>题目ID</th><th>得分</th><th>状态</th><th>时间</th></tr>
          </thead>
          <tbody>
            <tr v-for="r in records" :key="r.id">
              <td>{{ r.id }}</td>
              <td>{{ r.problemId }}</td>
              <td>{{ r.score }}</td>
              <td><span :class="['ui label', r.status==='AC' ? 'green' : r.status==='UN_AC' ? 'red' : '']">{{ r.status }}</span></td>
              <td>{{ new Date(r.createdAt).toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="!records.length" class="ui message">暂无评测记录</div>
      </div>
      <div class="ui bottom attached segment" v-show="tab==='solutions'">
        <div v-if="solutions.length">
          <div class="ui comments">
            <div class="comment" v-for="s in solutions" :key="s.id">
              <div class="content">
                <span class="author">题目 #{{ s.problemId }}</span>
                <div class="metadata">
                  <span class="date">{{ new Date(s.createdAt).toLocaleString() }}</span>
                  <span class="like-count" style="margin-left:1em;">👍 {{ s.likeCount }}</span>
                </div>
                <div class="text" style="white-space:pre-wrap;">{{ s.content }}</div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="ui message">暂无题解</div>
      </div>
    </div>
    <div v-else class="ui message">用户不存在</div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
const route = useRoute();
const user = ref(null);
const records = ref([]);
const solutions = ref([]);
const loading = ref(true);
const tab = ref('records');
onMounted(async () => {
  const id = route.params.id;
  try {
    const u = await axios.get(`http://localhost:3000/api/users/${id}`);
    user.value = u.data;
    const r = await axios.get(`http://localhost:3000/api/judgerecords?userId=${id}`);
    records.value = r.data;
    const s = await axios.get(`http://localhost:3000/api/solutions?userId=${id}`);
    solutions.value = s.data;
  } catch {
    user.value = null;
  }
  loading.value = false;
});
</script> 