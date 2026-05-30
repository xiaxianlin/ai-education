// 确保全局类型可用
declare global {
  /**
   * 登录模型
   */
  interface LoginRequest {
    username?: string;
    password?: string;
  }

  /**
   * 修改密码模型
   */
  interface ModifyPasswordRequest {
    origin?: string;
    password?: string;
  }

  /**
   * 创建管理员模型
   */
  interface CreateManagerRequest {
    username: string;
    type: ManagerType;
  }

  /**
   * 更新管理员请求
   */
  interface UpdateManagerRequest {
    status?: number;
    type?: ManagerType;
  }

  interface PasswordResponse {
    password: string;
  }

  /**
   * 教师查询参数
   */
  interface TeacherSearchRequest {
    keyword?: string;
    keywords?: string;
    subject?: string;
    status?: number;
    page?: number;
    size?: number;
  }

  /**
   * 教师信息
   */
  interface Teacher {
    id: string;
    account: string;
    name: string;
    phone: string;
    subject: string;
    school: string;
    status: number;
    create_time?: number;
    update_time?: number;
  }

  /**
   * 创建教师请求
   */
  interface CreateTeacherRequest {
    account: string;
    password?: string;
    name: string;
    phone: string;
    subject: string;
    school: string;
    status: number;
  }

  /**
   * 更新教师请求
   */
  interface UpdateTeacherRequest {
    account?: string;
    name?: string;
    phone?: string;
    subject?: string;
    school?: string;
    status?: number;
  }

  interface TeacherStats {
    student_count: number;
    textbook_count: number;
    ability_count: number;
    question_count: number;
  }

  interface TeacherDetailStudent {
    id: string;
    name?: string;
    phone?: string;
    grade?: number;
    semester?: string;
    subject?: string;
    status?: number;
  }

  interface TeacherDetailTextbook {
    id: number;
    subject?: string;
    version?: string;
    grade?: number;
    semester?: string;
  }

  interface TeacherDetailAbility {
    id: number;
    code?: string;
    name?: string;
    subject?: string;
    grade?: number;
    difficulty?: number;
    is_active?: number;
  }

  interface TeacherDetailQuestion {
    id: string;
    question_type_code?: string;
    subject?: string;
    grade?: number;
    difficulty?: string;
    create_time?: number;
  }

  /**
   * 教师详情
   */
  interface TeacherDetail {
    teacher: Teacher;
    stats: TeacherStats;
    students?: TeacherDetailStudent[];
    textbooks?: TeacherDetailTextbook[];
    abilities?: TeacherDetailAbility[];
    questions?: TeacherDetailQuestion[];
  }

  type TeacherClaimStatus = 'pending' | 'approved' | 'rejected';

  interface TeacherClaimStudent {
    id: string;
    name?: string;
    phone?: string;
    grade?: number;
    status?: number;
  }

  interface StudentTeacherClaim {
    id: number;
    student_id: string;
    teacher_id: string;
    status: TeacherClaimStatus;
    create_time?: number;
    update_time?: number;
    teacher?: Teacher;
    student?: TeacherClaimStudent;
  }

  interface UpdateTeacherClaimRequest {
    status: Extract<TeacherClaimStatus, 'approved' | 'rejected'>;
  }
}

export {};
