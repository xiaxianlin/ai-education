import { useProfileModel } from "@/common/models/ProfileModel";
import { Skeleton } from "@/components/ui";
import { GRADES } from "@ai-education/shared-web";
import { BookOpen, Phone } from "lucide-react";

export default function Profile() {
  const { profile, textbooks, loading } = useProfileModel();

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-springy">
      <div className="flex items-center gap-4 px-2">
        <div className="w-2 h-10 bg-accent rounded-full" />
        <h1 className="text-4xl font-black text-foreground">个人中心</h1>
      </div>

      {/* User Info Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-secondary/80 to-primary/10 rounded-[3rem] p-10 border-4 border-white shadow-2xl shadow-primary/5 bubbly-card">
        <div className="relative flex flex-col md:flex-row items-center gap-10">
          <div className="relative">
            <div className="h-32 w-32 rounded-3xl bg-white shadow-lg flex items-center justify-center text-6xl animate-float">
              👤
            </div>
            <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-accent rounded-2xl flex items-center justify-center shadow-lg border-2 border-white">
              <span className="text-white text-lg">✏️</span>
            </div>
          </div>

          <div className="text-center md:text-left space-y-4">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-48 mx-auto md:mx-0" />
                <Skeleton className="h-6 w-32 mx-auto md:mx-0" />
              </div>
            ) : (
              <>
                <h2 className="text-4xl font-black text-foreground">{profile?.name || "我的名字"}</h2>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/60 rounded-2xl text-sm font-bold text-muted-foreground italic">
                    <Phone className="h-4 w-4" />
                    {profile?.phone}
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-2xl text-sm font-bold text-primary">
                    <BookOpen className="h-4 w-4" />
                    {GRADES[profile?.grade || 0] || "一年级"}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Textbooks Section */}
      <div className="space-y-8">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-4">
            <div className="w-2 h-10 bg-primary rounded-full" />
            <h3 className="text-3xl font-black text-foreground">我的教材</h3>
          </div>
          <span className="px-5 py-2 bg-secondary rounded-2xl text-sm font-black text-primary">
            共 {textbooks?.length || 0} 本
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {textbooks?.map((book, idx) => (
            <div
              key={book.id}
              className="group relative bg-white rounded-[2rem] p-6 border-4 border-white shadow-xl shadow-primary/5 bubbly-card animate-springy"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-secondary/50 text-3xl group-hover:scale-110 transition-transform">
                  {book.subject === "数学" ? "🧮" : book.subject === "英语" ? "🔤" : "📖"}
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="text-xl font-black text-foreground truncate">{book.subject}</div>
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{book.version}</div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-primary/5 rounded-xl text-xs font-black text-primary">
                  {GRADES[book.grade || 0]}
                </span>
                <span className="px-3 py-1 bg-accent/10 rounded-xl text-xs font-black text-accent-foreground">
                  {book.semester}
                </span>
              </div>
            </div>
          ))}

          {(!textbooks || textbooks.length === 0) && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 bg-secondary/20 rounded-[3rem] border-4 border-dashed border-primary/20">
              <span className="text-6xl mb-4 opacity-50">📚</span>
              <p className="text-xl font-bold text-muted-foreground">暂无教材信息</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
