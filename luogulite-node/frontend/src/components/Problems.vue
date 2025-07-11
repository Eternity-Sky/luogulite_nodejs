<template>
  <div class="ui container" style="margin-top:2em;">
    <h2 class="ui header">题库</h2>
    <form v-if="user && user.isAdmin" class="ui form segment" @submit.prevent="addProblem" style="margin-bottom:2em;">
      <div class="field">
        <label>标题</label>
        <input v-model="newProblem.title" placeholder="题目标题" required />
      </div>
      <div class="field">
        <label>描述</label>
        <textarea v-model="newProblem.description" placeholder="题目描述" required></textarea>
      </div>
      <div class="field">
        <label>输入格式</label>
        <textarea v-model="newProblem.inputFormat" placeholder="输入格式" required></textarea>
      </div>
      <div class="field">
        <label>输出格式</label>
        <textarea v-model="newProblem.outputFormat" placeholder="输出格式" required></textarea>
      </div>
      <div class="field">
        <label>提示</label>
        <textarea v-model="newProblem.hint" placeholder="提示"></textarea>
      </div>
      <button class="ui primary button" :disabled="adding">新增题目</button>
      <span v-if="addError" class="ui red text">{{ addError }}</span>
    </form>
    <div v-if="loading" class="ui active inverted dimmer"><div class="ui loader"></div></div>
    <div v-else>
      <div class="ui stackable three cards">
        <div class="card" v-for="problem in problems" :key="problem.id" style="transition:box-shadow .2s;">
          <div class="content">
            <router-link :to="`/problems/${problem.id}`" class="header" style="font-size:1.2em;">{{ problem.title }}</router-link>
            <div class="meta" style="margin:0.5em 0; color:#888;">ID: {{ problem.id }}</div>
            <div class="description" style="min-height:3em;">{{ problem.description.slice(0, 60) }}...</div>
          </div>
          <div class="extra content" v-if="user && user.isAdmin">
            <button class="ui mini button" @click="editProblem(problem)">编辑</button>
            <button class="ui mini red button" @click="deleteProblem(problem.id)">删除</button>
          </div>
        </div>
      </div>
      <div v-if="editing" class="ui segment" style="margin-top:2em;">
        <h4>编辑题目</h4>
        <form class="ui form" @submit.prevent="updateProblem">
          <div class="field">
            <label>标题</label>
            <input v-model="editData.title" required />
          </div>
          <div class="field">
            <label>描述</label>
            <textarea v-model="editData.description" required></textarea>
          </div>
          <div class="field">
            <label>输入格式</label>
            <textarea v-model="editData.inputFormat" required></textarea>
          </div>
          <div class="field">
            <label>输出格式</label>
            <textarea v-model="editData.outputFormat" required></textarea>
          </div>
          <div class="field">
            <label>提示</label>
            <textarea v-model="editData.hint"></textarea>
          </div>
          <button class="ui primary button" :disabled="updating">保存</button>
          <button class="ui button" @click="cancelEdit" type="button">取消</button>
          <span v-if="editError" class="ui red text">{{ editError }}</span>
        </form>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, inject } from 'vue';
import axios from 'axios';
const problems = ref([]);
const loading = ref(true);
const newProblem = ref({ title: '', description: '', inputFormat: '', outputFormat: '', hint: '' });
const adding = ref(false);
const addError = ref('');
const editing = ref(false);
const editData = ref({ id: null, title: '', description: '', inputFormat: '', outputFormat: '', hint: '' });
const updating = ref(false);
const editError = ref('');
const user = inject('user');
function fetchProblems() {
  loading.value = true;
  axios.get('http://localhost:3000/api/problems').then(res => {
    problems.value = res.data;
    loading.value = false;
  });
}
onMounted(fetchProblems);
async function addProblem() {
  adding.value = true;
  addError.value = '';
  try {
    await axios.post('http://localhost:3000/api/problems', {
      ...newProblem.value,
      sampleTestcases: [],
      testcaseInfo: []
    }, { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });
    newProblem.value = { title: '', description: '', inputFormat: '', outputFormat: '', hint: '' };
    fetchProblems();
  } catch (e) {
    addError.value = '新增失败';
  }
  adding.value = false;
}
function editProblem(problem) {
  editing.value = true;
  editData.value = { ...problem };
}
function cancelEdit() {
  editing.value = false;
  editError.value = '';
}
async function updateProblem() {
  updating.value = true;
  editError.value = '';
  try {
    await axios.put(`http://localhost:3000/api/problems/${editData.value.id}`, editData.value, { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });
    editing.value = false;
    fetchProblems();
  } catch (e) {
    editError.value = '保存失败';
  }
  updating.value = false;
}
async function deleteProblem(id) {
  if (!confirm('确定删除？')) return;
  await axios.delete(`http://localhost:3000/api/problems/${id}`, { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });
  fetchProblems();
}
</script> 