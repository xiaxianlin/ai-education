import { AdminLayout } from '@/layouts/AdminLayout';
import Login from '@/pages/Auth/Login';
import Manager from '@/pages/Auth/Manager';
import ModifyPassword from '@/pages/Auth/Password';
import Profile from '@/pages/Auth/Profile';
import Home from '@/pages/Home';
import PracticeConfig from '@/pages/Practice/PracticeConfig';
import PracticeDetail from '@/pages/Practice/PracticeDetail';
import PracticeForm from '@/pages/Practice/PracticeForm';
import PracticeList from '@/pages/Practice/PracticeList';
import PracticePromptDetail from '@/pages/Practice/PromptDetail';
import PracticePromptForm from '@/pages/Practice/PromptForm';
import PracticePromptList from '@/pages/Practice/PromptList';
import PromptDetail from '@/pages/Prompt/Detail';
import PromptForm from '@/pages/Prompt/Form';
import PromptList from '@/pages/Prompt/List';
import PromptTest from '@/pages/Prompt/Test';
import QuestionDetail from '@/pages/Question/QuestionDetail';
import QuestionForm from '@/pages/Question/QuestionForm';
import QuestionList from '@/pages/Question/QuestionList';
import QuestionTemplateDetail from '@/pages/Question/TemplateDetail';
import QuestionTemplateForm from '@/pages/Question/TemplateForm';
import QuestionTemplateList from '@/pages/Question/TemplateList';
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
        { path: 'question_template', element: <QuestionTemplateList /> },
        { path: 'question_template/form', element: <QuestionTemplateForm /> },
        { path: 'question_template/form/:id', element: <QuestionTemplateForm /> },
        { path: 'question_template/detail/:id', element: <QuestionTemplateDetail /> },
        { path: 'prompt', element: <PromptList /> },
        { path: 'prompt/form', element: <PromptForm /> },
        { path: 'prompt/form/:id', element: <PromptForm /> },
        { path: 'prompt/detail/:id', element: <PromptDetail /> },
        { path: 'prompt/test', element: <PromptTest /> },
        // Practice routes
        { path: 'practice', element: <PracticeList /> },
        { path: 'practice/form', element: <PracticeForm /> },
        { path: 'practice/form/:id', element: <PracticeForm /> },
        { path: 'practice/detail/:id', element: <PracticeDetail /> },
        { path: 'practice/config', element: <PracticeConfig /> },
        // Practice Prompt routes
        { path: 'practice/prompt', element: <PracticePromptList /> },
        { path: 'practice/prompt/form', element: <PracticePromptForm /> },
        { path: 'practice/prompt/form/:id', element: <PracticePromptForm /> },
        { path: 'practice/prompt/detail/:id', element: <PracticePromptDetail /> },
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
