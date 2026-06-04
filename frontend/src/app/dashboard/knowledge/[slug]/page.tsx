"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Clock, Sparkles } from "lucide-react";
import {
  getArticle,
  getSimilarArticles,
  type Article,
  type SimilarArticle,
} from "../../../../services/article.service";

function getReadingTime(article: Article | SimilarArticle) {
  if ("readingTime" in article) {
    return article.readingTime;
  }

  if ("reading_time" in article) {
    return article.reading_time;
  }

  return undefined;
}

function getSourceLabel(source?: string) {
  if (source === "mongodb-fallback") {
    return "Recommended by category match";
  }

  return "Recommended using article similarity";
}

function SimilarReadCard({ article }: { article: SimilarArticle }) {
  const readingTime = getReadingTime(article);

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group flex min-h-56 flex-col justify-between rounded-lg border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-lg dark:hover:shadow-primary/10 md:min-w-80 md:max-w-80"
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {article.category}
          </span>
          {typeof article.similarity_score === "number" ? (
            <span className="rounded-full border border-secondary/30 bg-secondary/10 px-2.5 py-1 text-xs font-semibold text-secondary">
              {(article.similarity_score * 100).toFixed(0)}% match
            </span>
          ) : null}
        </div>

        <div className="space-y-2">
          <h3 className="line-clamp-2 text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
            {article.title}
          </h3>
          <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
            {article.summary}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          {readingTime ? `${readingTime} min read` : "Quick read"}
        </span>
        <Link
          href={`/dashboard/knowledge/${article.slug}`}
          className="font-semibold text-primary transition-colors hover:text-primary/80"
        >
          Read
        </Link>
      </div>
    </motion.article>
  );
}

export default function KnowledgeArticleDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [article, setArticle] = useState<Article | null>(null);
  const [similarArticles, setSimilarArticles] = useState<SimilarArticle[]>([]);
  const [recommendationSource, setRecommendationSource] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const articleBody = useMemo(() => {
    if (!article?.content) {
      return [];
    }

    return article.content
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  }, [article]);

  useEffect(() => {
    let isMounted = true;

    const fetchArticleDetail = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [articleResult, similarResult] = await Promise.all([
          getArticle(slug),
          getSimilarArticles(slug),
        ]);

        if (!isMounted) {
          return;
        }

        setArticle(articleResult);
        setSimilarArticles(similarResult.recommendations ?? []);
        setRecommendationSource(similarResult.source);
      } catch {
        if (isMounted) {
          setError("Unable to load this Knowledge Hub article right now.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (slug) {
      fetchArticleDetail();
    }

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-5xl items-center justify-center px-4 py-10">
        <div className="rounded-lg border border-border bg-card px-6 py-5 text-sm text-muted-foreground shadow-sm">
          Loading article...
        </div>
      </main>
    );
  }

  if (error || !article) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-10">
        <Link
          href="/dashboard/knowledge"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Knowledge Hub
        </Link>
        <div className="mt-8 rounded-lg border border-border bg-card p-6 text-muted-foreground shadow-sm">
          {error || "Article not found."}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/dashboard/knowledge"
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Knowledge Hub
      </Link>

      <article className="mt-6 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        {article.coverImage ? (
          <div
            className="h-64 w-full bg-cover bg-center sm:h-80"
            style={{ backgroundImage: `url(${article.coverImage})` }}
          />
        ) : null}

        <div className="space-y-6 p-6 sm:p-8 lg:p-10">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">
                {article.category}
              </span>
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-4 w-4" />
                {article.readingTime ? `${article.readingTime} min read` : "Quick read"}
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="max-w-4xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {article.title}
              </h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                {article.summary}
              </p>
            </div>
          </div>

          <div className="space-y-5 text-base leading-8 text-foreground/85">
            {articleBody.length ? (
              articleBody.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
            ) : (
              <p>{article.content}</p>
            )}
          </div>
        </div>
      </article>

      <section className="mt-10 space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
              <Sparkles className="h-3.5 w-3.5" />
              {getSourceLabel(recommendationSource)}
            </div>
            <h2 className="mt-3 text-2xl font-bold text-foreground">Similar Reads</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            More Knowledge Hub articles chosen from the current article context.
          </p>
        </div>

        {similarArticles.length ? (
          <div className="flex flex-col gap-4 md:flex-row md:overflow-x-auto md:pb-3">
            {similarArticles.map((similarArticle) => (
              <SimilarReadCard key={similarArticle.slug} article={similarArticle} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
            <BookOpen className="mb-3 h-5 w-5 text-primary" />
            No similar reads are available yet.
          </div>
        )}
      </section>
    </main>
  );
}
