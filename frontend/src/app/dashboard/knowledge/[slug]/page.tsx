"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Clock, Sparkles, Share2 } from "lucide-react";
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

function ArticleHeroGraphic({ article }: { article: Article }) {
  const category = article.category || "General";
  const title = article.title || "";
  
  // Set up gradients and layouts based on category
  let gradient = "from-rose-500/20 via-pink-500/10 to-transparent";
  let svgContent = null;
  
  switch (category) {
    case "PCOS":
      gradient = "from-rose-500/20 via-orange-500/10 to-transparent";
      svgContent = (
        <>
          <circle cx="100" cy="50" r="30" fill="url(#pcosGrad1)" opacity="0.4" />
          <circle cx="130" cy="70" r="20" fill="url(#pcosGrad2)" opacity="0.3" />
          <circle cx="80" cy="75" r="15" fill="url(#pcosGrad1)" opacity="0.2" />
          <path d="M140 30L142 33L145 34L142 35L140 38L138 35L135 34L138 33L140 30Z" fill="#fbbf24" />
          <path d="M60 40H66V46H60V40Z" fill="hsl(var(--primary))" opacity="0.3" />
          <path d="M63 37V49" stroke="hsl(var(--primary))" strokeWidth="2" opacity="0.5" />
          <path d="M57 43H69" stroke="hsl(var(--primary))" strokeWidth="2" opacity="0.5" />
        </>
      );
      break;
    case "Menstrual Health":
      gradient = "from-pink-500/20 via-rose-500/10 to-transparent";
      svgContent = (
        <>
          <rect x="75" y="30" width="50" height="50" rx="8" fill="url(#menstrualGrad)" opacity="0.3" stroke="hsl(var(--primary))" strokeWidth="1.5" />
          <line x1="75" y1="42" x2="125" y2="42" stroke="hsl(var(--primary))" strokeWidth="1.5" />
          <path d="M100 48C97 48 95 50 95 53C95 56 97 58 100 58C103 58 105 56 105 53C105 50 103 48 100 48Z" fill="hsl(var(--primary))" opacity="0.6" />
          <path d="M100 48L97.5 52.5C97 53.5 97 54 100 54C103 54 103 53.5 102.5 52.5L100 48Z" fill="hsl(var(--primary))" opacity="0.6" />
          <path d="M140 40L141.5 43.5L145 45L141.5 46.5L140 50L138.5 46.5L135 45L138.5 43.5L140 40Z" fill="#f43f5e" />
        </>
      );
      break;
    case "Skin & Hormones":
      gradient = "from-amber-500/20 via-yellow-500/10 to-transparent";
      svgContent = (
        <>
          <circle cx="100" cy="55" r="25" fill="none" stroke="hsl(var(--secondary))" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
          <circle cx="100" cy="55" r="18" fill="url(#skinGrad)" opacity="0.4" />
          <path d="M100 20V26" stroke="hsl(var(--secondary))" strokeWidth="2" />
          <path d="M100 84V90" stroke="hsl(var(--secondary))" strokeWidth="2" />
          <path d="M65 55H71" stroke="hsl(var(--secondary))" strokeWidth="2" />
          <path d="M129 55H135" stroke="hsl(var(--secondary))" strokeWidth="2" />
        </>
      );
      break;
    case "Lifestyle":
      gradient = "from-emerald-500/20 via-teal-500/10 to-transparent";
      svgContent = (
        <>
          <rect x="75" y="30" width="50" height="50" rx="25" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M92 45L100 52L112 40" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
          <circle cx="100" cy="55" r="8" fill="url(#lifestyleGrad)" opacity="0.3" />
          <path d="M140 60L141.5 63.5L145 65L141.5 66.5L140 70L138.5 66.5L135 65L138.5 63.5L140 60Z" fill="#10b981" />
        </>
      );
      break;
    case "Nutrition":
      gradient = "from-sky-500/20 via-blue-500/10 to-transparent";
      svgContent = (
        <>
          <path d="M85 65C85 50 100 35 100 35C100 35 115 50 115 65C115 75 108 82 100 82C92 82 85 75 85 65Z" fill="url(#nutritionGrad)" opacity="0.35" />
          <path d="M100 35V82" stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0.5" />
          <path d="M100 55C95 50 90 52 90 52" stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0.5" />
          <path d="M100 65C105 60 110 62 110 62" stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0.5" />
        </>
      );
      break;
    case "Mental Health":
      gradient = "from-indigo-500/20 via-purple-500/10 to-transparent";
      svgContent = (
        <>
          <path d="M100 38C95 33 85 33 80 38C75 43 75 53 100 75C125 53 125 43 120 38C115 33 105 33 100 38Z" fill="url(#mentalGrad)" opacity="0.4" />
          <path d="M70 70C85 65 95 75 110 70C125 65 130 70 130 70" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
        </>
      );
      break;
    default:
      svgContent = (
        <>
          <circle cx="100" cy="55" r="25" fill="url(#pcosGrad1)" opacity="0.3" />
        </>
      );
  }

  return (
    <div className={`relative h-64 w-full bg-gradient-to-b ${gradient} flex items-center justify-center border-b border-border/40 select-none overflow-hidden sm:h-80`}>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
      
      <div className="relative w-80 h-48 flex items-center justify-center z-10">
        <svg className="w-full h-full text-foreground/80" viewBox="0 0 200 110" fill="none" xmlns="http://www.w3.org/2000/svg">
          {svgContent}
          
          <defs>
            <linearGradient id="pcosGrad1" x1="70" y1="20" x2="130" y2="80" gradientUnits="userSpaceOnUse">
              <stop stopColor="hsl(var(--primary))" />
              <stop offset="1" stopColor="hsl(var(--secondary))" />
            </linearGradient>
            <linearGradient id="pcosGrad2" x1="110" y1="50" x2="150" y2="90" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f59e0b" />
              <stop offset="1" stopColor="#d97706" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="menstrualGrad" x1="75" y1="30" x2="125" y2="80" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f43f5e" />
              <stop offset="1" stopColor="#ec4899" />
            </linearGradient>
            <linearGradient id="skinGrad" x1="82" y1="37" x2="118" y2="73" gradientUnits="userSpaceOnUse">
              <stop stopColor="#d97706" />
              <stop offset="1" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id="lifestyleGrad" x1="92" y1="47" x2="108" y2="63" gradientUnits="userSpaceOnUse">
              <stop stopColor="#10b981" />
              <stop offset="1" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="nutritionGrad" x1="85" y1="35" x2="115" y2="82" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0284c7" />
              <stop offset="1" stopColor="#0ea5e9" />
            </linearGradient>
            <linearGradient id="mentalGrad" x1="80" y1="33" x2="120" y2="75" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6366f1" />
              <stop offset="1" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="absolute bottom-4 left-6 z-20 border border-border/40 bg-card/75 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-sm max-w-xs sm:max-w-md hidden sm:block">
        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{category} Care Guide</span>
        <h4 className="text-xs font-bold text-foreground mt-0.5 line-clamp-1">{title}</h4>
      </div>
    </div>
  );
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
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg" | "xl">("base");
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link: ", err);
    }
  };

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

      <article className="mt-6 overflow-hidden rounded-3xl border border-border bg-card shadow-sm relative">
        {/* Reading Progress Indicator */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-muted z-30">
          <div 
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-75"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        <ArticleHeroGraphic article={article} />

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

          {/* Reading & Utility Controls */}
          <div className="flex flex-col gap-4 border-y border-border/50 py-4 sm:flex-row sm:items-center sm:justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="font-semibold text-foreground">Author:</span> {article.author || 'SheCare Team'}
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Text Size Resizer */}
              <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-2.5 py-1">
                <span className="text-xs text-muted-foreground font-semibold mr-1 select-none">Text Size</span>
                <button
                  type="button"
                  onClick={() => setFontSize("sm")}
                  className={`h-6 w-6 rounded-full text-xs font-bold transition-all flex items-center justify-center ${
                    fontSize === "sm" ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted text-foreground"
                  }`}
                  title="Small text"
                >
                  A-
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize("base")}
                  className={`h-6 w-6 rounded-full text-xs font-bold transition-all flex items-center justify-center ${
                    fontSize === "base" ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted text-foreground"
                  }`}
                  title="Normal text"
                >
                  A
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize("lg")}
                  className={`h-6 w-6 rounded-full text-xs font-bold transition-all flex items-center justify-center ${
                    fontSize === "lg" ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted text-foreground"
                  }`}
                  title="Large text"
                >
                  A+
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize("xl")}
                  className={`h-6 w-6 rounded-full text-xs font-bold transition-all flex items-center justify-center ${
                    fontSize === "xl" ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted text-foreground"
                  }`}
                  title="Extra large text"
                >
                  A++
                </button>
              </div>

              {/* Share link button */}
              <button
                type="button"
                onClick={copyToClipboard}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs font-semibold text-foreground transition-all hover:bg-muted"
              >
                {copied ? (
                  <>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Share2 className="h-3.5 w-3.5" />
                    Share
                  </>
                )}
              </button>
            </div>
          </div>

          <div className={`space-y-5 leading-relaxed text-foreground/85 transition-all duration-200 ${
            fontSize === "sm" ? "text-sm" : 
            fontSize === "base" ? "text-base" : 
            fontSize === "lg" ? "text-lg sm:text-xl leading-loose" : "text-xl sm:text-2xl leading-loose"
          }`}>
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
