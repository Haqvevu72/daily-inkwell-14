import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, LogOut, ExternalLink } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchAllArticles, formatDate } from "@/lib/articles";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Editorial dashboard — Daily Reading" },
      { name: "description", content: "Manage drafts and published articles." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Editorial dashboard — Daily Reading" },
      { property: "og:description", content: "Manage drafts and published articles." },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["articles", "all"], queryFn: fetchAllArticles });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  async function remove(id: string, title: string) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (!error) await queryClient.invalidateQueries({ queryKey: ["articles"] });
  }

  const drafts = (data ?? []).filter((a) => a.status === "draft");
  const published = (data ?? []).filter((a) => a.status === "published");

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <h1 className="font-display text-lg font-semibold tracking-tight">Editorial dashboard</h1>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/">
                <ExternalLink className="size-4" /> View site
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="size-4" /> Sign out
            </Button>
            <Button asChild size="sm">
              <Link to="/admin/new">
                <Plus className="size-4" /> New article
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-10 px-5 py-10">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <>
            <Section title="Drafts" count={drafts.length}>
              {drafts.map((a) => (
                <Row key={a.id} article={a} onDelete={remove} />
              ))}
            </Section>
            <Section title="Published" count={published.length}>
              {published.map((a) => (
                <Row key={a.id} article={a} onDelete={remove} />
              ))}
            </Section>
          </>
        )}
      </main>
    </div>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
        {title} ({count})
      </h2>
      <div className="mt-3 divide-y divide-border rounded-lg border border-border bg-card">
        {count === 0 ? (
          <p className="px-5 py-6 text-sm text-muted-foreground">Nothing here yet.</p>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

function Row({
  article,
  onDelete,
}: {
  article: { id: string; title: string; slug: string; category: string; published_at: string | null; status: string };
  onDelete: (id: string, title: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div className="min-w-0">
        <p className="truncate font-display text-base font-medium">{article.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {article.category}
          {article.published_at ? ` · ${formatDate(article.published_at)}` : ""}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button asChild variant="ghost" size="icon" aria-label="Edit">
          <Link to="/admin/$id" params={{ id: article.id }}>
            <Pencil className="size-4" />
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Delete"
          onClick={() => onDelete(article.id, article.title)}
        >
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}