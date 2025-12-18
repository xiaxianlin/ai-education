import { Navigate, useRoutes } from 'react-router-dom';
import { AdminLayout } from '@/layouts/AdminLayout';
import Login from '@/pages/Login';
import Home from '@/pages/Home';
import Manager from '@/pages/Manager';
import TextbookList from '@/pages/Textbook/List';
import TextbookDetail from '@/pages/Textbook/Detail';
import TeacherBookList from '@/pages/TeacherBook/List';
import TeacherBookDetail from '@/pages/TeacherBook/Detail';
import QuestionList from '@/pages/Question/List';
import QuestionForm from '@/pages/Question/Form';
import QuestionDetail from '@/pages/Question/Detail';
import QuestionTypeList from '@/pages/QuestionType/List';
import PromptList from '@/pages/Prompt/List';
import PromptDetail from '@/pages/Prompt/Detail';
import PromptForm from '@/pages/Prompt/Form';
import PromptVersionList from '@/pages/Prompt/VersionList';
import PromptTest from '@/pages/Prompt/Test';
import PromptTestRecords from '@/pages/Prompt/TestRecords';
import StudentList from '@/pages/Student/List';
import StudentDetail from '@/pages/Student/Detail';
import PracticeDetail from '@/pages/Student/PraticeDetail';
import ModifyPassword from '@/pages/ModifyPassword';
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
        { path: 'prompt/test/records', element: <PromptTestRecords /> },
        { path: 'student', element: <StudentList /> },
        { path: 'student/detail/:id', element: <StudentDetail /> },
        { path: 'practice/detail/:session_id', element: <PracticeDetail /> },
        { path: 'password', element: <ModifyPassword /> },
        { path: '*', element: <NotFound /> },
      ],
    },
  ]);
}
