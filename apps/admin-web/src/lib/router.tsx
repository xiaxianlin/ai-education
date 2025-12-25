import { AdminLayout } from '@/layouts/AdminLayout';
import Login from '@/pages/Auth/Login';
import Manager from '@/pages/Auth/Manager';
import ModifyPassword from '@/pages/Auth/Password';
import Profile from '@/pages/Auth/Profile';
import Home from '@/pages/Home';
import PracticeConfig from '@/pages/Practice/Config';
import PracticeList from '@/pages/Practice/List';
import PracticePrompt from '@/pages/Practice/Prompt';
import PromptDetail from '@/pages/Prompt/Detail';
import PromptForm from '@/pages/Prompt/Form';
import PromptList from '@/pages/Prompt/List';
import PromptTest from '@/pages/Prompt/Test';
import QuestionDetail from '@/pages/Question/Detail';
import QuestionForm from '@/pages/Question/Form';
import QuestionList from '@/pages/Question/List';
import QuestionTypeList from '@/pages/Question/Type';
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
        { path: 'prompt', element: <PromptList /> },
        { path: 'prompt/form', element: <PromptForm /> },
        { path: 'prompt/detail', element: <PromptDetail /> },
        { path: 'prompt/test', element: <PromptTest /> },
        { path: 'practice', element: <PracticeList /> },
        { path: 'practice/config', element: <PracticeConfig /> },
        { path: 'practice/prompt', element: <PracticePrompt /> },
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
