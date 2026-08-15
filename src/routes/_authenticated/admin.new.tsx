import { createFileRoute } from "@tanstack/react-router";
import { ArticleForm } from "@/components/ArticleForm";

export const Route = createFileRoute("/_authenticated/admin/new")({
  head: () => ({
    meta: [
      { title: "New article — Daily Reading" },
      { name: "description", content: "Write and publish a new daily article." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "New article — Daily Reading" },
      { property: "og:description", content: "Write and publish a new daily article." },
    ],
  }),
  component: () => <ArticleForm />,
});