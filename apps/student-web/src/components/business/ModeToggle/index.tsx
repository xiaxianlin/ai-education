import { Moon, Sun } from "lucide-react";

import { Button, Dropdown, DropdownItem } from "@/components/ui";
import { useTheme } from "@/components/theme-provider";

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <Dropdown
      trigger={
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      }
      align="right"
    >
      <DropdownItem onClick={() => setTheme("light")}>Light</DropdownItem>
      <DropdownItem onClick={() => setTheme("dark")}>Dark</DropdownItem>
      <DropdownItem onClick={() => setTheme("system")}>System</DropdownItem>
    </Dropdown>
  );
}
