import { useEffect } from "react";

/**
 * Grade theme mapping:
 * - Grade 1-2: "low" (Joyful Land 快乐乐园)
 * - Grade 3-4: "middle" (Adventure World 探索世界)
 * - Grade 5-6: "high" (Focus Studio 专注学堂)
 * - Grade 7+: "high" (default to high grade theme)
 */
type GradeTheme = "low" | "middle" | "high";

/**
 * Get theme based on student grade
 */
const getThemeByGrade = (grade?: number): GradeTheme => {
  if (!grade) return "low"; // Default to low grade theme
  
  if (grade <= 2) return "low";
  if (grade <= 4) return "middle";
  return "high"; // Grade 5 and above
};

/**
 * Hook to automatically apply grade-based theme
 * Adds data-grade attribute to document body
 */
export const useGradeTheme = (grade?: number) => {
  useEffect(() => {
    const theme = getThemeByGrade(grade);
    
    // Apply theme to body element
    document.body.setAttribute("data-grade", theme);
    
    // Cleanup function to remove attribute on unmount
    return () => {
      document.body.removeAttribute("data-grade");
    };
  }, [grade]);
};
