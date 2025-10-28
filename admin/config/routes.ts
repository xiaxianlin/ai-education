export default [
  { path: '/', redirect: '/home' },
  {
    path: '/home',
    name: '首页',
    icon: 'dashboard',
    component: './Home',
  },
  {
    path: '/manager',
    name: '账号管理',
    icon: 'user',
    component: './Manager',
  },
  {
    path: '/textbook',
    name: '教材管理',
    icon: 'book',
    component: './Textbook/List',
  },
  {
    path: '/textbook/detail/:id',
    component: './Textbook/Detail',
  },
  {
    path: '/question',
    name: '题目管理',
    icon: 'question',
    component: './Question',
  },
  { path: '/password', component: './ModifyPassword' },
  { path: '/login', layout: false, component: './Login' },
  { path: '*', layout: false, component: './404' },
];
