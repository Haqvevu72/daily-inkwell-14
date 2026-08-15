import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { ArticleForm } from "@/components/ArticleForm";
import { PUBLIC_FIELDS, type Article } from "@/lib/articles";

export const Route = createFileRoute("/_authenticated/admin/$id")({
  head: () => ({
    meta: [
      { title: "Edit article — Daily Reading" },
      { name: "description", content: "Edit an existing daily article." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Edit article — Daily Reading" },
      { property: "og:description", content: "Edit an existing daily article." },
    ],
  }),
  component: EditArticle,
});

function EditArticle() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["article", "admin", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select(PUBLIC_FIELDS)
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return (data as Article | null) ?? null;
    },
  });

  if (isLoading) {
    return <div className="p-10 text-sm text-muted-foreground">Loading…</div>;
  }
  if (!data) {
    return <div className="p-10 text-sm text-muted-foreground">Article not found.</div>;
  }
  return <ArticleForm article={data} />;
}