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

  const categories = ["all", "PCOS", "Menstrual Health", "Skin & Hormones", "Lifestyle", "Nutrition", "Mental Health"];

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
      <section className="relative rounded-3xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-sm sm:p-8">
        {/* Clipped background container for ambient glow shapes */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute right-12 bottom-0 h-48 w-48 rounded-full bg-secondary/5 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col gap-6 lg:pr-72">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20">
              <BookOpen className="h-3.5 w-3.5" />
              Knowledge Hub
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl leading-tight font-display bg-gradient-to-r from-foreground via-foreground/95 to-muted-foreground bg-clip-text">
              Learn about cycles, hormones, PCOS, and everyday care.
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base max-w-xl">
              Search SheCare articles and get smart suggestions.
            </p>
          </div>

          <form onSubmit={submitSearch} className="relative w-full max-w-2xl">
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

        {/* Floating Book & Sparkles Illustration on Right Side */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 w-72 h-44 hidden lg:flex items-center justify-center pointer-events-none select-none">
          <svg className="w-full h-full" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="60" r="35" fill="url(#headerGlowGrad)" opacity="0.3" filter="blur(4px)" />
            {/* Styled pages and spine */}
            <path d="M72 42C72 36.4772 76.4772 32 82 32H100V88H82C76.4772 88 72 83.5228 72 78V42Z" fill="url(#leftPageGrad)" />
            <path d="M128 42C128 36.4772 123.523 32 118 32H100V88H118C123.523 88 128 83.5228 128 78V42Z" fill="url(#rightPageGrad)" />
            {/* Sparkles */}
            <path d="M100 18L101.5 22L105.5 23.5L101.5 25L100 29L98.5 25L94.5 23.5L98.5 22L100 18Z" fill="#fbbf24" opacity="0.95" />
            <path d="M142 62L143 65L146 66L143 67L142 70L141 67L138 66L141 65L142 62Z" fill="hsl(var(--primary))" opacity="0.8" />
            <path d="M58 72L59 75L62 76L59 77L58 80L57 77L54 76L57 75L58 72Z" fill="hsl(var(--secondary))" opacity="0.75" />
            
            <defs>
              <linearGradient id="headerGlowGrad" x1="65" y1="25" x2="135" y2="95" gradientUnits="userSpaceOnUse">
                <stop stopColor="hsl(var(--primary))" />
                <stop offset="1" stopColor="hsl(var(--secondary))" />
              </linearGradient>
              <linearGradient id="leftPageGrad" x1="72" y1="32" x2="100" y2="88" gradientUnits="userSpaceOnUse">
                <stop stopColor="hsl(var(--primary))" stopOpacity="0.45" />
                <stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="rightPageGrad" x1="128" y1="32" x2="100" y2="88" gradientUnits="userSpaceOnUse">
                <stop stopColor="hsl(var(--secondary))" stopOpacity="0.45" />
                <stop offset="1" stopColor="hsl(var(--secondary))" stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>
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
