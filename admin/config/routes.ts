import { layout } from '@/app';

export default [
  { path: '/', redirect: '/home' },
  {
    path: '/home',
    name: '首页',
    icon: 'dashboard',
    component: './Home',
  },
  {
    path: '/user',
    name: '用户管理',
    icon: 'user',
    routes: [
      {
        path: '/user/account',
        name: '账号管理',
        component: './UserManagement/Account',
      },
    ],
  },
  {
    path: '/course',
    name: '课程管理',
    icon: 'book',
    wrappers: ['@/layouts/CourseLayout'],
    routes: [
      {
        path: '/course/textbook',
        name: '教材管理',
        component: './Course/Textbook/List',
      },
      {
        path: '/course/textbook/detail/:id',
        component: './Course/Textbook/Detail',
      },
      {
        path: '/course/question',
        name: '题目管理',
        component: './Course/Question',
      },
    ],
  },
  {
    path: '/system',
    name: '系统管理',
    icon: 'setting',
    routes: [
      {
        path: '/system/manager',
        name: '后台账号',
        component: './System/Manager',
      },
      {
        path: '/system/subject',
        name: '学科类目',
        component: './System/Subject',
      },
      {
        path: '/system/textbook-version',
        name: '教材版本',
        component: './System/TextbookVersion',
      },
    ],
  },
  { path: '/password', component: './Auth/Password' },
  { path: '/login', layout: false, component: './Auth/Login' },
  { path: '*', layout: false, component: './404' },
];
