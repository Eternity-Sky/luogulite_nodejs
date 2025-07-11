<template>
  <div class="ui container" style="margin-top:2em;">
    <h2 class="ui header">评测记录</h2>
    <form class="ui form segment" @submit.prevent="addRecord" style="margin-bottom:2em;">
      <div class="field">
        <input v-model.number="newRecord.userId" placeholder="用户ID" required />
      </div>
      <div class="field">
        <input v-model.number="newRecord.problemId" placeholder="题目ID" required />
      </div>
      <div class="field">
        <select v-model="newRecord.status" required>
          <option value="">请选择状态</option>
          <option value="AC">AC</option>
          <option value="UN_AC">UN_AC</option>
          <option value="CE">CE</option>
        </select>
      </div>
      <div class="field">
        <input v-model.number="newRecord.score" placeholder="得分" required />
      </div>
      <button class="ui primary button" :disabled="adding">新增评测记录</button>
      <span v-if="addError" class="ui red text">{{ addError }}</span>
    </form>
    <form class="ui form segment" @submit.prevent="fetchRecords" style="margin-bottom:2em;">
      <div class="fields">
        <div class="field">
          <input v-model="filter.userId" placeholder="筛选用户ID" />
        </div>
        <div class="field">
          <input v-model="filter.problemId" placeholder="筛选题目ID" />
        </div>
        <button class="ui button">筛选</button>
      </div>
    </form>
    <div v-if="loading" class="ui active inverted dimmer"><div class="ui loader"></div></div>
    <div v-else>
      <table class="ui celled striped table">
        <thead>
          <tr>
            <th>ID</th>
            <th>用户</th>
            <th>题目</th>
            <th>状态</th>
            <th>得分</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in records" :key="record.id">
            <td>{{ record.id }}</td>
            <td>{{ record.userId }}</td>
            <td>{{ record.problemId }}</td>
            <td>
              <span :class="['ui label',
                record.status==='AC' ? 'green' :
                record.status==='UN_AC' ? 'red' :
                record.status==='CE' ? 'yellow' : '']">
                {{ record.status }}
              </span>
            </td>
            <td>{{ record.score }}</td>
            <td>
              <router-link :to="`/judgerecord/${record.id}`" class="ui button mini">查看详情</router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
const records = ref([]);
const loading = ref(true);
const newRecord = ref({ userId: '', problemId: '', status: '', score: '' });
const adding = ref(false);
const addError = ref('');
const filter = ref({ userId: '', problemId: '' });
function fetchRecords() {
  loading.value = true;
  let url = 'http://localhost:3000/api/judgerecords';
  const params = [];
  if (filter.value.userId) params.push(`userId=${filter.value.userId}`);
  if (filter.value.problemId) params.push(`problemId=${filter.value.problemId}`);
  if (params.length) url += '?' + params.join('&');
  axios.get(url).then(res => {
    records.value = res.data;
    loading.value = false;
  });
}
onMounted(fetchRecords);
async function addRecord() {
  adding.value = true;
  addError.value = '';
  try {
    await axios.post('http://localhost:3000/api/judgerecords', newRecord.value);
    newRecord.value = { userId: '', problemId: '', status: '', score: '' };
    fetchRecords();
  } catch (e) {
    addError.value = '新增失败';
  }
  adding.value = false;
}
</script> 