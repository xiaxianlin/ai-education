import { AdminLayout } from '@/layouts/AdminLayout';
import AtomicList from '@/pages/Ability/AtomicList';
import DomainList from '@/pages/Ability/DomainList';
import Login from '@/pages/Auth/Login';
import Manager from '@/pages/Auth/Manager';
import ModifyPassword from '@/pages/Auth/Password';
import Profile from '@/pages/Auth/Profile';
import Home from '@/pages/Home';
import PracticeDetail from '@/pages/Practice/PracticeDetail';
import PracticeList from '@/pages/Practice/PracticeList';
import QuestionDetail from '@/pages/Question/QuestionDetail';
import QuestionForm from '@/pages/Question/QuestionForm';
import QuestionList from '@/pages/Question/QuestionList';
import QuestionTypeDetail from '@/pages/Question/QuestionTypeDetail';
import QuestionTypeForm from '@/pages/Question/QuestionTypeForm';
import QuestionTypeGenerate from '@/pages/Question/QuestionTypeGenerate';
import QuestionTypeList from '@/pages/Question/QuestionTypeList';
import StudentDetail from '@/pages/Student/StudentDetail';
import StudentList from '@/pages/Student/StudentList';
import TeacherBookDetail from '@/pages/TeacherBook/Detail';
import TeacherBookList from '@/pages/TeacherBook/List';
import TextbookDetail from '@/pages/Textbook/Detail';
import TextbookList from '@/pages/Textbook/List';
import { Navigate, useRoutes } from 'react-router-dom';

import { InitialStateModel } from '@/models/initialState';
import NotFound from '@/pages/404';

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
        // Ability routes
        { path: 'ability/domain', element: <DomainList /> },
        { path: 'ability/atomic', element: <AtomicList /> },
        { path: 'question', element: <QuestionList /> },
        { path: 'question/form', element: <QuestionForm /> },
        { path: 'question/form/:id', element: <QuestionForm /> },
        { path: 'question/detail/:id', element: <QuestionDetail /> },
        { path: 'question_type', element: <QuestionTypeList /> },
        { path: 'question_type/form', element: <QuestionTypeForm /> },
        { path: 'question_type/form/:id', element: <QuestionTypeForm /> },
        { path: 'question_type/detail/:id', element: <QuestionTypeDetail /> },
        { path: 'question_type/generate/:code', element: <QuestionTypeGenerate /> },
        // Practice routes
        { path: 'practice', element: <PracticeList /> },
        { path: 'practice/detail/:id', element: <PracticeDetail /> },
        // Student routes
        { path: 'student', element: <StudentList /> },
        { path: 'student/detail/:id', element: <StudentDetail /> },
        { path: 'password', element: <ModifyPassword /> },
        { path: 'profile', element: <Profile /> },
        { path: '*', element: <NotFound /> },
      ],
    },
  ]);
}
