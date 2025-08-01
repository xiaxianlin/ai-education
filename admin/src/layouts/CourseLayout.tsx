import { Outlet } from '@umijs/max';
import { CourseModel } from '@/models/course';

export default function () {
  return (
    <CourseModel.Provider>
      <Outlet />
    </CourseModel.Provider>
  );
}
