import { AdminLayout } from '@/layouts/AdminLayout';
import Login from '@/pages/Auth/Login';
import Manager from '@/pages/Auth/Manager';
import ModifyPassword from '@/pages/Auth/Password';
import Profile from '@/pages/Auth/Profile';
import Home from '@/pages/Home';
import PracticeDetail from '@/pages/Practice/PracticeDetail';
import PracticeForm from '@/pages/Practice/PracticeForm';
import PracticeList from '@/pages/Practice/PracticeList';
import QuestionDetail from '@/pages/Question/QuestionDetail';
import QuestionForm from '@/pages/Question/QuestionForm';
import QuestionList from '@/pages/Question/QuestionList';
import QuestionTypeDetail from '@/pages/Question/TypeDetail';
import QuestionTypeForm from '@/pages/Question/TypeForm';
import QuestionTypeList from '@/pages/Question/TypeList';
import StudentDetail from '@/pages/Student/Detail';
import StudentList from '@/pages/Student/List';
import PracticeSessionList from '@/pages/Student/PracticeSessionList';
import PracticeSessionDetail from '@/pages/Student/PraticeSessionDetail';
import TeacherBookDetail from '@/pages/TeacherBook/Detail';
import TeacherBookList from '@/pages/TeacherBook/List';
import TextbookDetail from '@/pages/Textbook/Detail';
import TextbookList from '@/pages/Textbook/List';
import { Navigate, useRoutes } from 'react-router-dom';

import NotFound from '@/pages/404';

export function Router() {
  return useRoutes([
    {
      path: '/login',
      element: <Login />,
    },
    {
      path: '/',
      element: <AdminLayout />,
      children: [
        { index: true, element: <Navigate to="/home" replace /> },
        { path: 'home', element: <Home /> },
        { path: 'manager', element: <Manager /> },
        { path: 'textbook', element: <TextbookList /> },
        { path: 'textbook/detail/:id', element: <TextbookDetail /> },
        { path: 'teacher_book', element: <TeacherBookList /> },
        { path: 'teacher_book/detail/:id', element: <TeacherBookDetail /> },
        { path: 'question', element: <QuestionList /> },
        { path: 'question/form', element: <QuestionForm /> },
        { path: 'question/form/:id', element: <QuestionForm /> },
        { path: 'question/detail/:id', element: <QuestionDetail /> },
        { path: 'question_type', element: <QuestionTypeList /> },
        { path: 'question_type/form', element: <QuestionTypeForm /> },
        { path: 'question_type/form/:id', element: <QuestionTypeForm /> },
        { path: 'question_type/detail/:id', element: <QuestionTypeDetail /> },
        // Practice routes
        { path: 'practice', element: <PracticeList /> },
        { path: 'practice/form', element: <PracticeForm /> },
        { path: 'practice/form/:id', element: <PracticeForm /> },
        { path: 'practice/detail/:id', element: <PracticeDetail /> },
        // Student routes
        { path: 'student', element: <StudentList /> },
        { path: 'student/detail/:id', element: <StudentDetail /> },
        { path: 'student/:id/practice_sessions', element: <PracticeSessionList /> },
        { path: 'student/:id/practice_session/:session_id', element: <PracticeSessionDetail /> },
        { path: 'password', element: <ModifyPassword /> },
        { path: 'profile', element: <Profile /> },
        { path: '*', element: <NotFound /> },
      ],
    },
  ]);
}
