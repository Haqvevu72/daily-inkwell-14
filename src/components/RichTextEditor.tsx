import { useEffect, useRef } from "react";
import { Bold, Italic, Heading2, List, Quote, Link2, Undo2 } from "lucide-react";

type Props = {
  value: string;
  onChange: (html: string) => void;
};

const tools = [
  { cmd: "bold", icon: Bold, label: "Bold" },
  { cmd: "italic", icon: Italic, label: "Italic" },
  { cmd: "formatBlock", arg: "H2", icon: Heading2, label: "Heading" },
  { cmd: "insertUnorderedList", icon: List, label: "Bulleted list" },
  { cmd: "formatBlock", arg: "BLOCKQUOTE", icon: Quote, label: "Quote" },
  { cmd: "createLink", icon: Link2, label: "Link" },
  { cmd: "undo", icon: Undo2, label: "Undo" },
] as const;

export function RichTextEditor({ value, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el && el.innerHTML !== value) el.innerHTML = value;
    // only sync when the incoming value changes from outside
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value === "" ? "" : undefined]);

  function run(cmd: string, arg?: string) {
    ref.current?.focus();
    if (cmd === "createLink") {
      const url = window.prompt("Link URL");
      if (!url) return;
      document.execCommand("createLink", false, url);
    } else {
      document.execCommand(cmd, false, arg);
    }
    onChange(ref.current?.innerHTML ?? "");
  }

  return (
    <div className="overflow-hidden rounded-lg border border-input bg-card">
      <div className="flex flex-wrap gap-0.5 border-b border-border p-1.5">
        {tools.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.label}
              type="button"
              title={t.label}
              aria-label={t.label}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => run(t.cmd, "arg" in t ? t.arg : undefined)}
              className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Icon className="size-4" />
            </button>
          );
        })}
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="Article content"
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        className="prose-reading min-h-[24rem] px-5 py-4 outline-none"
      />
    </div>
  );
}