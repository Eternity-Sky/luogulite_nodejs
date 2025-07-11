import { createRouter, createWebHistory } from 'vue-router';
import Home from './components/Home.vue';
import Problems from './components/Problems.vue';
import ProblemDetail from './components/ProblemDetail.vue';
import User from './components/User.vue';
import Records from './components/Records.vue';
import NotFound from './components/NotFound.vue';
import Login from './components/Login.vue';
import Register from './components/Register.vue';
import JudgeRecordDetail from './components/JudgeRecordDetail.vue';
import UserProfile from './components/UserProfile.vue';
import AdminPanel from './components/AdminPanel.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/problems', component: Problems },
  { path: '/problems/:id', component: ProblemDetail },
  { path: '/users/:id', component: UserProfile },
  { path: '/records', component: Records },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/judgerecord/:id', component: JudgeRecordDetail },
  { path: '/admin', component: AdminPanel },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router; 