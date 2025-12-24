import { BookOpen, LogOut, Phone, User } from "lucide-react";

import { Button, Card, CardContent, Skeleton } from "@/components/ui";

import { useAuthModel } from "@/common/models/AuthModel";
import { useProfileModel } from "@/common/models/ProfileModel";
import { GRADES } from "@ai-education/shared-web";

export default function Profile() {
  const { profile, textbooks, loading } = useProfileModel();
  const { logout } = useAuthModel();

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-2xl pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">个人中心</h1>
      </div>

      <Card className="border-none shadow-md bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-10 w-10 text-primary" />
            </div>
            <div className="text-center">
              {loading ? (
                <>
                  <Skeleton className="h-8 w-32 mx-auto mb-2" />
                  <Skeleton className="h-4 w-24 mx-auto" />
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold">{profile?.name}</h2>
                  <p className="text-muted-foreground mt-1 flex items-center justify-center gap-2">
                    <Phone className="h-4 w-4" />
                    {profile?.phone}
                  </p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <BookOpen className="h-5 w-5 text-primary" />
          <h3>我的教材</h3>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {textbooks?.map((book) => (
            <Card key={book.id} className="overflow-hidden transition-all hover:shadow-md">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="font-medium">{book.subject}</div>
                  <div className="text-sm text-muted-foreground">
                    {book.version} · {GRADES[book.grade || 0]} · {book.semester}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {(!textbooks || textbooks.length === 0) && (
            <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg">暂无教材信息</div>
          )}
        </div>
      </div>

      <div className="pt-2">
        <Button size="lg" variant="destructive" className="w-full" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          退出登录
        </Button>
      </div>
    </div>
  );
}
