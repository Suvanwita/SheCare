"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Clock, Search, Sparkles, Tag } from "lucide-react";
import {
  getArticleSuggestions,
  getArticles,
  type Article,
  type ArticleSuggestion,
} from "../../../services/article.service";

function getSuggestionTypeLabel(type: ArticleSuggestion["type"]) {
  const labels = {
    title: "Article",
    tag: "Tag",
    keyword: "Keyword",
    category: "Category",
  };

  return labels[type];
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group flex h-full flex-col justify-between rounded-lg border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-lg dark:hover:shadow-primary/10"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {article.category}
          </span>
          {article.featured ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2.5 py-1 text-xs font-semibold text-secondary">
              <Sparkles className="h-3 w-3" />
              Featured
            </span>
          ) : null}
        </div>

        <div className="space-y-2">
          <h2 className="line-clamp-2 text-xl font-bold text-foreground transition-colors group-hover:text-primary">
            {article.title}
          </h2>
          <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
            {article.summary}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          {article.readingTime ? `${article.readingTime} min read` : "Quick read"}
        </span>
        <Link
          href={`/dashboard/knowledge/${article.slug}`}
          className="font-semibold text-primary transition-colors hover:text-primary/80"
        >
          Read article
        </Link>
      </div>
    </motion.article>
  );
}

export default function KnowledgeHubPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [suggestions, setSuggestions] = useState<ArticleSuggestion[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const categories = useMemo(() => {
    return ["all", ...Array.from(new Set(articles.map((article) => article.category)))];
  }, [articles]);

  useEffect(() => {
    let isMounted = true;

    const fetchArticles = async () => {
      setIsLoading(true);
      setError("");

      try {
        const result = await getArticles({
          q: activeQuery,
          category,
          limit: 24,
        });

        if (isMounted) {
          setArticles(result.articles);
        }
      } catch {
        if (isMounted) {
          setError("Unable to load Knowledge Hub articles right now.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchArticles();

    return () => {
      isMounted = false;
    };
  }, [activeQuery, category]);

  useEffect(() => {
    let isMounted = true;
    const query = searchQuery.trim();

    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        const result = await getArticleSuggestions(query);

        if (isMounted) {
          setSuggestions(result);
        }
      } catch {
        if (isMounted) {
          setSuggestions([]);
        }
      }
    }, 200);

    return () => {
      isMounted = false;
      window.clearTimeout(timeoutId);
    };
  }, [searchQuery]);

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActiveQuery(searchQuery.trim());
    setSuggestions([]);
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <BookOpen className="h-3.5 w-3.5" />
              Knowledge Hub
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Learn about cycles, hormones, PCOS, and everyday care.
            </h1>
            <p className="text-sm leading-6 text-muted-foreground sm:text-base">
              Search SheCare articles and get smart suggestions from the backend Trie.
            </p>
          </div>

          <form onSubmit={submitSearch} className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search PCOS, acne, cycle tracking..."
              className="h-12 w-full rounded-lg border border-input bg-background pl-11 pr-4 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {suggestions.length ? (
              <div className="absolute left-0 right-0 top-14 z-20 overflow-hidden rounded-lg border border-border bg-card shadow-xl">
                {suggestions.map((suggestion) => (
                  <Link
                    key={`${suggestion.slug}-${suggestion.type}-${suggestion.label}`}
                    href={`/dashboard/knowledge/${suggestion.slug}`}
                    className="flex items-center justify-between gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted"
                  >
                    <span>
                      <span className="font-semibold text-foreground">
                        {suggestion.label}
                      </span>
                      <span className="ml-2 text-muted-foreground">
                        {suggestion.category}
                      </span>
                    </span>
                    <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-semibold text-secondary">
                      {getSuggestionTypeLabel(suggestion.type)}
                    </span>
                  </Link>
                ))}
              </div>
            ) : null}
          </form>
        </div>
      </section>

      <section className="mt-6 flex flex-wrap gap-2">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              category === item
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            <Tag className="h-4 w-4" />
            {item === "all" ? "All articles" : item}
          </button>
        ))}
      </section>

      {error ? (
        <div className="mt-8 rounded-lg border border-border bg-card p-6 text-muted-foreground shadow-sm">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="mt-8 rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
          Loading Knowledge Hub articles...
        </div>
      ) : null}

      {!isLoading && !error ? (
        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {articles.length ? (
            articles.map((article) => <ArticleCard key={article.slug} article={article} />)
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-card p-6 text-sm text-muted-foreground sm:col-span-2 xl:col-span-3">
              No articles matched your search.
            </div>
          )}
        </section>
      ) : null}
    </main>
  );
}
