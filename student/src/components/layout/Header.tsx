import { useState, useEffect } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { authApi, StudentInfo } from '@/services/auth';
import { profileApi, StudentProfile, Textbook } from '@/services/profile';
import { Dropdown, DropdownItem } from '@/components/ui/dropdown';
import { Button } from '@/components/ui/button';
import { LogOut, BookOpen, ChevronDown, User, Home } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function Header() {
  const { logout } = useAuthStore();
  const location = useLocation();
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [currentTextbook, setCurrentTextbook] = useState<Textbook | null>(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const isHomePage = location.pathname === '/home';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentData, profileData, textbooksData] = await Promise.all([
        authApi.check(),
        profileApi.getProfile(),
        profileApi.getTextbooks(),
      ]);
      
      setStudentInfo(studentData);
      setProfile(profileData);
      setTextbooks(textbooksData || []);
      
      // 找到当前教材
      if (profileData?.current_textbook_id) {
        const current = textbooksData?.find(t => t.id === profileData.current_textbook_id);
        setCurrentTextbook(current || null);
      }
    } catch (error: any) {
      console.error('Failed to load header data:', error);
      // 不显示错误提示，避免干扰用户体验
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchTextbook = async (textbookId: number) => {
    try {
      setSwitching(true);
      await profileApi.updateProfile({ current_textbook_id: textbookId });
      const updatedProfile = await profileApi.getProfile();
      const newCurrent = textbooks.find(t => t.id === textbookId);
      
      setProfile(updatedProfile);
      setCurrentTextbook(newCurrent || null);
      toast.success('教材切换成功');
      
      // 刷新页面以更新所有相关数据
      window.location.reload();
    } catch (error: any) {
      console.error('Failed to switch textbook:', error);
      toast.error(error.message || '切换教材失败');
    } finally {
      setSwitching(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const getGradeLabel = (grade: number) => {
    const gradeMap: Record<number, string> = {
      1: '一年级',
      2: '二年级',
      3: '三年级',
      4: '四年级',
      5: '五年级',
      6: '六年级',
    };
    return gradeMap[grade] || `年级${grade}`;
  };

  const getTextbookDisplayName = (textbook: Textbook) => {
    return `${textbook.subject} ${textbook.version} ${getGradeLabel(textbook.grade)} ${textbook.semester}`;
  };

  if (loading) {
    return (
      <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
        <div className="h-16 flex items-center justify-between px-4">
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="h-16 flex items-center justify-between px-4 gap-4">
        {/* 左侧：教材信息 */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Dropdown
            trigger={
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer max-w-full">
                <span className="text-xl">📚</span>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs text-gray-500">当前教材</span>
                  <span className="text-sm font-semibold text-gray-900 truncate">
                    {currentTextbook
                      ? getTextbookDisplayName(currentTextbook)
                      : '未设置教材'}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
              </div>
            }
            align="start"
          >
            <div className="py-1 max-h-[300px] overflow-y-auto">
              {textbooks.length > 0 ? (
                <>
                  {textbooks.map((textbook) => {
                    const isCurrent = currentTextbook?.id === textbook.id;
                    return (
                      <DropdownItem
                        key={textbook.id}
                        onClick={() => !isCurrent && handleSwitchTextbook(textbook.id)}
                        disabled={isCurrent || switching}
                        className={cn(
                          'py-2 px-3',
                          isCurrent && 'bg-blue-50 text-blue-700 font-semibold'
                        )}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-base">{isCurrent ? '✨' : '📖'}</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{textbook.subject}</div>
                              <div className="text-xs text-gray-500 truncate">
                                {textbook.version} · {getGradeLabel(textbook.grade)} · {textbook.semester}
                              </div>
                            </div>
                          </div>
                          {isCurrent && (
                            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">当前</span>
                          )}
                        </div>
                      </DropdownItem>
                    );
                  })}
                </>
              ) : (
                <DropdownItem disabled className="text-gray-500 text-center py-3">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xl">📚</span>
                    <span className="text-xs">暂无教材</span>
                  </div>
                </DropdownItem>
              )}
            </div>
          </Dropdown>
        </div>

        {/* 右侧：个人信息和操作 */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {!isHomePage && (
            <Link
              to="/home"
              title="返回首页"
              className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Home className="h-4 w-4 text-gray-600" />
            </Link>
          )}

          <Link
            to="/profile"
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-sm font-semibold text-gray-900 truncate">
                {studentInfo?.name || '学生'}
              </span>
            </div>
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="h-9 px-2 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="退出登录"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}

