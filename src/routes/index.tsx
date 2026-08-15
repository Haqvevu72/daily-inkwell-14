import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { SiteHeader } from "@/components/SiteHeader";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { fetchPublishedArticles, formatDate, readingTime } from "@/lib/articles";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Daily Reading — one considered essay a day" },
      {
        name: "description",
        content:
          "A quiet daily feed of long-form essays on habits, reading and living. Choose light, sepia or dark and set your own text size.",
      },
      { property: "og:title", content: "Daily Reading — one considered essay a day" },
      {
        property: "og:description",
        content: "A quiet daily feed of long-form essays. Read in light, sepia or dark.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");

  const { data, isLoading } = useQuery({
    queryKey: ["articles", "published"],
    queryFn: fetchPublishedArticles,
  });

  const categories = useMemo(
    () => ["All", ...Array.from(new Set((data ?? []).map((a) => a.category))).sort()],
    [data],
  );

  const articles = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter((a) => {
      const matchesCategory = category === "All" || a.category === category;
      const matchesQuery =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        formatDate(a.published_at).toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [data, query, category]);

  const [lead, ...rest] = articles;

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 pb-24">
        <section className="border-b border-border py-12">
          <h1 className="font-display text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
            Something worth reading, every day.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            No feeds to scroll, no accounts to make. Just one considered piece at a time — in the
            theme and text size that suits your eyes.
          </p>
        </section>

        <section className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title or date…"
              aria-label="Search articles"
              className="bg-card pl-9"
            />
          </div>
          <div className="-mx-1 flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-200",
                  category === c
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </section>

        {isLoading ? (
          <div className="space-y-8 pt-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-7 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Nothing published yet. Check back tomorrow.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {lead ? (
              <article className="py-8">
                <Link to="/article/$slug" params={{ slug: lead.slug }} className="group block">
                  {lead.cover_image_url ? (
                    <img
                      src={lead.cover_image_url}
                      alt=""
                      loading="lazy"
                      className="mb-6 aspect-[16/8] w-full rounded-xl object-cover"
                    />
                  ) : null}
                  <Meta article={lead} />
                  <h2 className="mt-2 font-display text-3xl leading-snug font-semibold tracking-tight group-hover:text-primary">
                    {lead.title}
                  </h2>
                  <p className="mt-3 text-[0.975rem] leading-relaxed text-muted-foreground">
                    {lead.excerpt}
                  </p>
                </Link>
              </article>
            ) : null}
            {rest.map((a) => (
              <article key={a.id} className="py-7">
                <Link
                  to="/article/$slug"
                  params={{ slug: a.slug }}
                  className="group flex items-start gap-5"
                >
                  <div className="min-w-0 flex-1">
                    <Meta article={a} />
                    <h2 className="mt-1.5 font-display text-xl leading-snug font-semibold tracking-tight group-hover:text-primary">
                      {a.title}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {a.excerpt}
                    </p>
                  </div>
                  {a.cover_image_url ? (
                    <img
                      src={a.cover_image_url}
                      alt=""
                      loading="lazy"
                      className="hidden size-24 shrink-0 rounded-lg object-cover sm:block"
                    />
                  ) : null}
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function Meta({ article }: { article: { category: string; published_at: string | null; content: string } }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs tracking-wide text-muted-foreground uppercase">
      <span className="text-primary">{article.category}</span>
      <span aria-hidden>·</span>
      <time dateTime={article.published_at ?? undefined}>{formatDate(article.published_at)}</time>
      <span aria-hidden>·</span>
      <span>{readingTime(article.content)} min read</span>
    </div>
  );
}
