<template>
  <div class="ui container" style="margin-top:2em;">
    <h2 class="ui header">评测详情 #{{ record.id }}</h2>
    <div v-if="loading" class="ui active inverted dimmer"><div class="ui loader"></div></div>
    <div v-else-if="record.detail && record.detail.length">
      <table class="ui celled table">
        <thead>
          <tr><th>测试点</th><th>输入</th><th>预期输出</th><th>用户输出</th><th>分值</th><th>结果</th></tr>
        </thead>
        <tbody>
          <tr v-for="(tc, idx) in record.detail" :key="idx">
            <td>{{ idx+1 }}</td>
            <td><pre>{{ tc.input }}</pre></td>
            <td><pre>{{ tc.expectedOutput }}</pre></td>
            <td><pre>{{ tc.userOutput }}</pre></td>
            <td>{{ tc.score }}</td>
            <td>
              <span :class="['ui label', tc.passed ? 'green' : 'red']">{{ tc.passed ? '通过' : '未通过' }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="ui message">无测试点详情</div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
const route = useRoute();
const record = ref({});
const loading = ref(true);
onMounted(async () => {
  const id = route.params.id;
  const res = await axios.get(`http://localhost:3000/api/judgerecords/${id}`);
  record.value = res.data;
  loading.value = false;
});
</script> 