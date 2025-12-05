import { useEffect } from "react";
import { useProfileStore } from "@/stores/profile-store";

/**
 * Grade theme mapping:
 * - Grade 1-2: "low" (Joyful Land 快乐乐园)
 * - Grade 3-4: "middle" (Adventure World 探索世界)
 * - Grade 5-6: "high" (Focus Studio 专注学堂)
 * - Grade 7+: "high" (default to high grade theme)
 */
export type GradeTheme = "low" | "middle" | "high";

/**
 * Get theme based on student grade
 */
export const getThemeByGrade = (grade?: number): GradeTheme => {
  if (!grade) return "low"; // Default to low grade theme
  
  if (grade <= 2) return "low";
  if (grade <= 4) return "middle";
  return "high"; // Grade 5 and above
};

/**
 * Hook to get grade-based theme
 * Returns the theme value that can be used in styles
 */
export const useGradeTheme = (): GradeTheme => {
  const student = useProfileStore((state) => state.student);
  return getThemeByGrade(student?.grade);
};

