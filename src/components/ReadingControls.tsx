import { Moon, Sun, BookOpen, Type } from "lucide-react";
import { useReadingTheme, type ReadingSize, type ReadingTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const themes: { value: ReadingTheme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "sepia", label: "Sepia", icon: BookOpen },
  { value: "dark", label: "Dark", icon: Moon },
];

const sizes: { value: ReadingSize; label: string }[] = [
  { value: "small", label: "S" },
  { value: "medium", label: "M" },
  { value: "large", label: "L" },
];

export function ReadingControls() {
  const { theme, size, setTheme, setSize } = useReadingTheme();

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center rounded-full border border-border bg-card p-0.5">
        {themes.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.value}
              type="button"
              aria-label={`${t.label} theme`}
              aria-pressed={theme === t.value}
              onClick={() => setTheme(t.value)}
              className={cn(
                "rounded-full p-1.5 transition-colors duration-300",
                theme === t.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
            </button>
          );
        })}
      </div>
      <div className="flex items-center rounded-full border border-border bg-card p-0.5">
        <Type className="mx-1.5 size-3.5 text-muted-foreground" aria-hidden />
        {sizes.map((s) => (
          <button
            key={s.value}
            type="button"
            aria-label={`${s.label} text size`}
            aria-pressed={size === s.value}
            onClick={() => setSize(s.value)}
            className={cn(
              "min-w-7 rounded-full px-1.5 py-1 text-xs font-medium transition-colors duration-300",
              size === s.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}