import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

import { SiteHeader } from "@/components/SiteHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchPublishedArticle, formatDate, readingTime } from "@/lib/articles";

export const Route = createFileRoute("/article/$slug")({
  head: ({ params }) => {
    const readable = params.slug.replace(/-/g, " ");
    const title = readable.charAt(0).toUpperCase() + readable.slice(1);
    return {
      meta: [
        { title: `${title} — Daily Reading` },
        { name: "description", content: `Read "${title}" on Daily Reading.` },
        { property: "og:title", content: `${title} — Daily Reading` },
        { property: "og:description", content: `Read "${title}" on Daily Reading.` },
        { property: "og:type", content: "article" },
      ],
    };
  },
  component: ArticlePage,
});

function ArticlePage() {
  const { slug } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["article", slug],
    queryFn: () => fetchPublishedArticle(slug),
  });

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-5 pt-10 pb-28">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> All articles
        </Link>

        {isLoading ? (
          <div className="mt-10 space-y-4">
            <Skeleton className="h-10 w-4/5" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : !data ? (
          <div className="py-24 text-center">
            <h1 className="font-display text-2xl font-semibold">Article not found</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              It may have been unpublished or moved.
            </p>
          </div>
        ) : (
          <article className="mt-8">
            <div className="flex flex-wrap items-center gap-2 text-xs tracking-wide text-muted-foreground uppercase">
              <span className="text-primary">{data.category}</span>
              <span aria-hidden>·</span>
              <time dateTime={data.published_at ?? undefined}>{formatDate(data.published_at)}</time>
              <span aria-hidden>·</span>
              <span>{readingTime(data.content)} min read</span>
            </div>
            <h1 className="mt-3 font-display text-4xl leading-tight font-semibold tracking-tight">
              {data.title}
            </h1>
            {data.excerpt ? (
              <p className="mt-4 font-display text-lg leading-relaxed text-muted-foreground italic">
                {data.excerpt}
              </p>
            ) : null}
            {data.cover_image_url ? (
              <img
                src={data.cover_image_url}
                alt=""
                className="mt-8 aspect-[16/9] w-full rounded-xl object-cover"
              />
            ) : null}
            <div className="prose-reading mt-10">
              {data.content.includes("<") && data.content.includes(">") ? (
                <div dangerouslySetInnerHTML={{ __html: data.content }} />
              ) : (
                data.content
                  .split(/\n{2,}/)
                  .filter(Boolean)
                  .map((p, i) => <p key={i}>{p}</p>)
              )}
            </div>
          </article>
        )}
      </main>
    </div>
  );
}