import { AdminLayout } from '@/layouts/AdminLayout';
import Ability from '@/pages/Ability';
import Login from '@/pages/Auth/Login';
import Manager from '@/pages/Auth/Manager';
import ModifyPassword from '@/pages/Auth/Password';
import Profile from '@/pages/Auth/Profile';
import Home from '@/pages/Home';
import PracticeDetail from '@/pages/Practice/PracticeDetail';
import PracticeList from '@/pages/Practice/PracticeList';
import QuestionGenerate from '@/pages/Question/QuestionGenerate';
import QuestionList from '@/pages/Question/QuestionList';
import QuestionTypeList from '@/pages/Question/QuestionTypeList';
import QuestionTypeSettings from '@/pages/Question/QuestionTypeSettings';
import StudentDetail from '@/pages/Student/StudentDetail';
import StudentList from '@/pages/Student/StudentList';
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
        { path: 'question', element: <QuestionList /> },
        { path: 'question/generate/:code', element: <QuestionGenerate /> },
        { path: 'question_type', element: <QuestionTypeList /> },
        { path: 'question_type/settings/:type/:code', element: <QuestionTypeSettings /> },
        // Ability routes
        { path: 'ability', element: <Ability /> },
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
