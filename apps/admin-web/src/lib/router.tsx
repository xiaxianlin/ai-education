import { Navigate, useRoutes } from 'react-router-dom';
import { AdminLayout } from '@/layouts/AdminLayout';
import Home from '@/pages/Home';
import Login from '@/pages/Auth/Login';
import Manager from '@/pages/Auth/Manager';
import ModifyPassword from '@/pages/Auth/Password';
import TextbookList from '@/pages/Textbook/List';
import TextbookDetail from '@/pages/Textbook/Detail';
import TeacherBookList from '@/pages/TeacherBook/List';
import TeacherBookDetail from '@/pages/TeacherBook/Detail';
import QuestionList from '@/pages/Question/List';
import QuestionForm from '@/pages/Question/Form';
import QuestionDetail from '@/pages/Question/Detail';
import QuestionTypeList from '@/pages/Question/Type';
import PromptList from '@/pages/Prompt/List';
import PromptDetail from '@/pages/Prompt/Detail';
import PromptForm from '@/pages/Prompt/Form';
import PromptVersionList from '@/pages/Prompt/VersionList';
import PromptTest from '@/pages/Prompt/Test';
import PracticeList from '@/pages/Practice/List';
import PracticeConfig from '@/pages/Practice/Config';
import PracticePromptNew from '@/pages/Practice/Prompt';
import StudentList from '@/pages/Student/List';
import StudentDetail from '@/pages/Student/Detail';
import PracticeData from '@/pages/Student/Pratice';

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
        { path: 'prompt/list', element: <PromptList /> },
        { path: 'prompt/form', element: <PromptForm /> },
        { path: 'prompt/detail', element: <PromptDetail /> },
        { path: 'prompt/versions', element: <PromptVersionList /> },
        { path: 'prompt/test', element: <PromptTest /> },
        { path: 'practice/list', element: <PracticeList /> },
        { path: 'practice/config', element: <PracticeConfig /> },
        { path: 'practice/prompt', element: <PracticePromptNew /> },
        { path: 'student', element: <StudentList /> },
        { path: 'student/detail/:id', element: <StudentDetail /> },
        { path: 'practice/detail/:session_id', element: <PracticeData /> },
        { path: 'password', element: <ModifyPassword /> },
        { path: '*', element: <NotFound /> },
      ],
    },
  ]);
}
