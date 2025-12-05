import { lazy } from 'react';
import { createHashRouter, Navigate } from 'react-router-dom';
import { AdminLayout } from '@/layouts/AdminLayout';
import { ProtectedRouteGuard } from '@/components/guards/ProtectedRouteGuard';
import { GuestRouteGuard } from '@/components/guards/GuestRouteGuard';

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

export const router = createHashRouter([
  {
    path: '/login',
    element: (
      <GuestRouteGuard>
        <Login />
      </GuestRouteGuard>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRouteGuard>
        <AdminLayout />
      </ProtectedRouteGuard>
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
]);

