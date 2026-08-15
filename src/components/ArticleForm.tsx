import { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/RichTextEditor";
import { slugify, type Article } from "@/lib/articles";

type Draft = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  category: string;
  published_at: string;
};

function toLocalInput(value: string | null) {
  const d = value ? new Date(value) : new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

export function ArticleForm({ article }: { article?: Article }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Draft>({
    title: article?.title ?? "",
    slug: article?.slug ?? "",
    excerpt: article?.excerpt ?? "",
    content: article?.content ?? "",
    cover_image_url: article?.cover_image_url ?? "",
    category: article?.category ?? "General",
    published_at: toLocalInput(article?.published_at ?? null),
  });

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save(status: "draft" | "published") {
    setSaving(true);
    setError(null);
    const slug = (form.slug.trim() || slugify(form.title)) + "";
    const payload = {
      title: form.title.trim(),
      slug,
      excerpt: form.excerpt.trim(),
      content: form.content,
      cover_image_url: form.cover_image_url.trim() || null,
      category: form.category.trim() || "General",
      status,
      published_at: status === "published" ? new Date(form.published_at).toISOString() : null,
    };

    if (!payload.title) {
      setError("A title is required.");
      setSaving(false);
      return;
    }

    const { error: saveError } = article
      ? await supabase.from("articles").update(payload).eq("id", article.id)
      : await supabase.from("articles").insert(payload);

    setSaving(false);
    if (saveError) {
      setError(saveError.message);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["articles"] });
    navigate({ to: "/admin" });
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-5 py-3.5">
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Dashboard
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={saving} onClick={() => save("draft")}>
              Save draft
            </Button>
            <Button size="sm" disabled={saving} onClick={() => save("published")}>
              Publish
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-5 py-8">
        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => {
              const v = e.target.value;
              setForm((f) => ({
                ...f,
                title: v,
                slug: article ? f.slug : slugify(v),
              }));
            }}
            placeholder="An unhurried headline"
            className="bg-card font-display text-lg"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className="bg-card"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="published_at">Publish date</Label>
            <Input
              id="published_at"
              type="datetime-local"
              value={form.published_at}
              onChange={(e) => set("published_at", e.target.value)}
              className="bg-card"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="slug">URL slug</Label>
          <Input
            id="slug"
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            className="bg-card font-mono text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cover">Cover image URL</Label>
          <Input
            id="cover"
            value={form.cover_image_url}
            onChange={(e) => set("cover_image_url", e.target.value)}
            placeholder="https://…"
            className="bg-card"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea
            id="excerpt"
            value={form.excerpt}
            onChange={(e) => set("excerpt", e.target.value)}
            rows={2}
            className="bg-card"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Content</Label>
          <RichTextEditor value={form.content} onChange={(html) => set("content", html)} />
        </div>
      </main>
    </div>
  );
}