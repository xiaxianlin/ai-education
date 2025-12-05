import { lazy } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
import { AdminLayout } from '@/layouts/AdminLayout';
import { InitialStateModel } from '../models/initialState';
import { createBrowserHistory } from "history";

export const history = createBrowserHistory();

export function go(path: string, replace = false) {
  if (replace) {
    history.replace(path);
  } else {
    history.push(path);
  }
}


// 懒加载页面组件
const Login = lazy(() => import('@/pages/Login'));
const Home = lazy(() => import('@/pages/Home'));
const Manager = lazy(() => import('@/pages/Manager'));
const TextbookList = lazy(() => import('@/pages/Textbook/List'));
const TextbookDetail = lazy(() => import('@/pages/Textbook/Detail'));
const TeacherBookList = lazy(() => import('@/pages/TeacherBook/List'));
const TeacherBookDetail = lazy(() => import('@/pages/TeacherBook/Detail'));
const QuestionList = lazy(() => import('@/pages/Question/List'));
const QuestionEdit = lazy(() => import('@/pages/Question/Edit'));
const QuestionDetail = lazy(() => import('@/pages/Question/Detail'));
const StudentList = lazy(() => import('@/pages/Student/List'));
const StudentDetail = lazy(() => import('@/pages/Student/Detail'));
const PracticeDetail = lazy(() => import('@/pages/Student/PraticeDetail'));
const ModifyPassword = lazy(() => import('@/pages/ModifyPassword'));
const NotFound = lazy(() => import('@/pages/404'));

export function Router() {
  return useRoutes([
    {
      path: '/login',
      element: <Login />,
    },
    {
      path: '/',
      element: (
        <InitialStateModel.Provider>
          <AdminLayout />
        </InitialStateModel.Provider>
      ),
      children: [
        { index: true, element: <Navigate to="/home" replace /> },
        { path: 'home', element: <Home /> },
        { path: 'manager', element: <Manager /> },
        { path: 'textbook', element: <TextbookList /> },
        { path: 'textbook/detail/:id', element: <TextbookDetail /> },
        { path: 'teacher_book', element: <TeacherBookList /> },
        { path: 'teacher_book/detail/:id', element: <TeacherBookDetail /> },
        { path: 'question', element: <QuestionList /> },
        { path: 'question/edit/:id', element: <QuestionEdit /> },
        { path: 'question/detail/:id', element: <QuestionDetail /> },
        { path: 'student', element: <StudentList /> },
        { path: 'student/detail/:id', element: <StudentDetail /> },
        { path: 'practice/detail/:session_id', element: <PracticeDetail /> },
        { path: 'password', element: <ModifyPassword /> },
        { path: '*', element: <NotFound /> },
      ],
    },
  ])
}


