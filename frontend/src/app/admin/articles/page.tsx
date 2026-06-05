"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Download,
  Edit3,
  FileText,
  Newspaper,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import type { AdminArticlePayload } from "../../../services/adminArticle.service";
import type { Article } from "../../../services/article.service";
import { useAdminArticleStore } from "../../../store/adminArticleStore";

const emptyForm: AdminArticlePayload = {
  title: "",
  slug: "",
  category: "",
  summary: "",
  content: "",
  coverImage: "",
  tags: [],
  keywords: [],
  readingTime: 5,
  author: "",
  featured: false,
  isPublished: true,
};

type ArticleModalMode = "create" | "edit";

function listToText(values?: string[]) {
  return (values ?? []).join(", ");
}

function textToList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function ArticleFormModal({
  article,
  mode,
  isSubmitting,
  onClose,
  onSubmit,
}: {
  article: Article | null;
  mode: ArticleModalMode;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: AdminArticlePayload) => Promise<void>;
}) {
  const [form, setForm] = useState<AdminArticlePayload>(emptyForm);
  const [tagsText, setTagsText] = useState("");
  const [keywordsText, setKeywordsText] = useState("");

  useEffect(() => {
    if (article) {
      setForm({
        title: article.title,
        slug: article.slug,
        category: article.category,
        summary: article.summary,
        content: article.content,
        coverImage: article.coverImage ?? "",
        tags: article.tags ?? [],
        keywords: article.keywords ?? [],
        readingTime: article.readingTime ?? 5,
        author: article.author ?? "",
        featured: Boolean(article.featured),
        isPublished: Boolean(article.isPublished),
      });
      setTagsText(listToText(article.tags));
      setKeywordsText(listToText(article.keywords));
      return;
    }

    setForm(emptyForm);
    setTagsText("");
    setKeywordsText("");
  }, [article]);

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await onSubmit({
      ...form,
      slug: form.slug?.trim() || undefined,
      readingTime: Number(form.readingTime) || 0,
      tags: textToList(tagsText),
      keywords: textToList(keywordsText),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 px-4 backdrop-blur-sm">
      <form
        onSubmit={submitForm}
        className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg border border-border bg-card p-5 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {mode === "create" ? "Create article" : "Edit article"}
            </p>
            <h2 className="mt-1 text-2xl font-black text-foreground">
              Knowledge Hub article
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close article form"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-xs font-bold text-muted-foreground">Title</span>
            <input
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              required
              className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-bold text-muted-foreground">
              Slug optional
            </span>
            <input
              value={form.slug}
              onChange={(event) => setForm({ ...form, slug: event.target.value })}
              placeholder="generated from title if blank"
              className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-bold text-muted-foreground">Category</span>
            <input
              value={form.category}
              onChange={(event) =>
                setForm({ ...form, category: event.target.value })
              }
              required
              className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-bold text-muted-foreground">Author</span>
            <input
              value={form.author}
              onChange={(event) => setForm({ ...form, author: event.target.value })}
              className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-bold text-muted-foreground">
              Reading time
            </span>
            <input
              type="number"
              min={0}
              value={form.readingTime}
              onChange={(event) =>
                setForm({ ...form, readingTime: Number(event.target.value) })
              }
              className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-bold text-muted-foreground">
              Cover image
            </span>
            <input
              value={form.coverImage}
              onChange={(event) =>
                setForm({ ...form, coverImage: event.target.value })
              }
              placeholder="/images/knowledge/article.jpg"
              className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="space-y-1.5 md:col-span-2">
            <span className="text-xs font-bold text-muted-foreground">Summary</span>
            <textarea
              value={form.summary}
              onChange={(event) =>
                setForm({ ...form, summary: event.target.value })
              }
              required
              rows={3}
              className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="space-y-1.5 md:col-span-2">
            <span className="text-xs font-bold text-muted-foreground">Content</span>
            <textarea
              value={form.content}
              onChange={(event) =>
                setForm({ ...form, content: event.target.value })
              }
              required
              rows={10}
              className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm leading-6 outline-none focus:border-primary"
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-bold text-muted-foreground">Tags</span>
            <input
              value={tagsText}
              onChange={(event) => setTagsText(event.target.value)}
              placeholder="pcos, nutrition, hormones"
              className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-bold text-muted-foreground">Keywords</span>
            <input
              value={keywordsText}
              onChange={(event) => setKeywordsText(event.target.value)}
              placeholder="irregular periods, acne, insulin"
              className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary"
            />
          </label>
          <div className="grid gap-3 md:col-span-2 sm:grid-cols-2">
            <label className="flex items-center gap-3 rounded-2xl border border-border bg-muted/30 px-4 py-3">
              <input
                type="checkbox"
                checked={Boolean(form.featured)}
                onChange={(event) =>
                  setForm({ ...form, featured: event.target.checked })
                }
                className="h-4 w-4 accent-primary"
              />
              <span className="text-sm font-bold text-foreground">Featured</span>
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-border bg-muted/30 px-4 py-3">
              <input
                type="checkbox"
                checked={Boolean(form.isPublished)}
                onChange={(event) =>
                  setForm({ ...form, isPublished: event.target.checked })
                }
                className="h-4 w-4 accent-primary"
              />
              <span className="text-sm font-bold text-foreground">Published</span>
            </label>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-border px-4 py-2.5 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-2xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-sm shadow-primary/20 transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : "Save article"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AdminArticlesPage() {
  const articles = useAdminArticleStore((state) => state.articles);
  const pagination = useAdminArticleStore((state) => state.pagination);
  const filters = useAdminArticleStore((state) => state.filters);
  const isLoading = useAdminArticleStore((state) => state.isLoading);
  const isSubmitting = useAdminArticleStore((state) => state.isSubmitting);
  const isToolRunning = useAdminArticleStore((state) => state.isToolRunning);
  const error = useAdminArticleStore((state) => state.error);
  const toolMessage = useAdminArticleStore((state) => state.toolMessage);
  const fetchArticles = useAdminArticleStore((state) => state.fetchArticles);
  const createArticle = useAdminArticleStore((state) => state.createArticle);
  const updateArticle = useAdminArticleStore((state) => state.updateArticle);
  const deleteArticle = useAdminArticleStore((state) => state.deleteArticle);
  const publishArticle = useAdminArticleStore((state) => state.publishArticle);
  const unpublishArticle = useAdminArticleStore((state) => state.unpublishArticle);
  const featureArticle = useAdminArticleStore((state) => state.featureArticle);
  const unfeatureArticle = useAdminArticleStore((state) => state.unfeatureArticle);
  const refreshSearch = useAdminArticleStore((state) => state.refreshSearch);
  const exportCsv = useAdminArticleStore((state) => state.exportCsv);
  const retrainRecommender = useAdminArticleStore(
    (state) => state.retrainRecommender
  );
  const [search, setSearch] = useState(filters.search ?? "");
  const [category, setCategory] = useState(filters.category ?? "all");
  const [publishedFilter, setPublishedFilter] = useState(
    filters.isPublished ?? "all"
  );
  const [featuredFilter, setFeaturedFilter] = useState(filters.featured ?? "all");
  const [modalMode, setModalMode] = useState<ArticleModalMode | null>(null);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(articles.map((article) => article.category)))],
    [articles]
  );

  useEffect(() => {
    fetchArticles({ page: 1, limit: 10 });
  }, [fetchArticles]);

  const applyFilters = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    fetchArticles({
      search: search.trim(),
      category,
      isPublished: publishedFilter,
      featured: featuredFilter,
      page: 1,
    });
  };

  const closeModal = () => {
    setEditingArticle(null);
    setModalMode(null);
  };

  const saveArticle = async (payload: AdminArticlePayload) => {
    if (modalMode === "edit" && editingArticle) {
      await updateArticle(editingArticle._id, payload);
    } else {
      await createArticle(payload);
    }

    closeModal();
  };

  return (
    <section className="space-y-5">
      <div className="glass-card rounded-lg p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Newspaper className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Admin Module
              </p>
              <h1 className="mt-1 text-3xl font-black tracking-tight text-foreground">
                Articles
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                Manage Knowledge Hub publishing, search suggestions, and recommendation data exports.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={refreshSearch}
              disabled={isToolRunning}
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2 text-xs font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-60"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Search
            </button>
            <button
              type="button"
              onClick={exportCsv}
              disabled={isToolRunning}
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2 text-xs font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <button
              type="button"
              onClick={retrainRecommender}
              disabled={isToolRunning}
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2 text-xs font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-60"
            >
              <UploadCloud className="h-4 w-4" />
              Retrain
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingArticle(null);
                setModalMode("create");
              }}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-sm shadow-primary/20 transition-colors hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              New article
            </button>
          </div>
        </div>
      </div>

      <form
        onSubmit={applyFilters}
        className="grid gap-3 rounded-lg border border-border bg-card p-4 shadow-sm xl:grid-cols-[1fr_12rem_12rem_12rem_auto]"
      >
        <label className="relative">
          <span className="sr-only">Search articles</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title, category, tags, keywords..."
            className="h-11 w-full rounded-2xl border border-input bg-background pl-10 pr-4 text-sm outline-none focus:border-primary"
          />
        </label>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="h-11 rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary"
        >
          {categories.map((item) => (
            <option key={item} value={item}>
              {item === "all" ? "All categories" : item}
            </option>
          ))}
        </select>
        <select
          value={publishedFilter}
          onChange={(event) =>
            setPublishedFilter(event.target.value as "all" | "true" | "false")
          }
          className="h-11 rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary"
        >
          <option value="all">All statuses</option>
          <option value="true">Published</option>
          <option value="false">Draft</option>
        </select>
        <select
          value={featuredFilter}
          onChange={(event) =>
            setFeaturedFilter(event.target.value as "all" | "true" | "false")
          }
          className="h-11 rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary"
        >
          <option value="all">All featured</option>
          <option value="true">Featured</option>
          <option value="false">Not featured</option>
        </select>
        <button
          type="submit"
          className="h-11 rounded-2xl border border-border bg-foreground px-5 text-sm font-bold text-background transition-colors hover:bg-foreground/90"
        >
          Apply
        </button>
      </form>

      {error ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
          {error}
        </div>
      ) : null}

      {toolMessage ? (
        <div className="rounded-lg border border-primary/20 bg-primary/10 p-4 text-sm font-semibold text-primary">
          {toolMessage}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[68rem] text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Article</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Reading</th>
                <th className="px-4 py-3">Published</th>
                <th className="px-4 py-3">Featured</th>
                <th className="px-4 py-3">Views</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center font-semibold text-muted-foreground">
                    Loading articles...
                  </td>
                </tr>
              ) : null}

              {!isLoading && articles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center font-semibold text-muted-foreground">
                    No articles found.
                  </td>
                </tr>
              ) : null}

              {!isLoading &&
                articles.map((article) => (
                  <tr key={article._id} className="border-b border-border/70 last:border-0">
                    <td className="px-4 py-4">
                      <div>
                        <p className="line-clamp-1 font-bold text-foreground">
                          {article.title}
                        </p>
                        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                          {article.slug}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {article.category}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {article.readingTime ?? 0} min
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          article.isPublished
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {article.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          article.featured
                            ? "bg-secondary/10 text-secondary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {article.featured ? "Featured" : "Standard"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {article.views ?? 0}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            article.isPublished
                              ? unpublishArticle(article._id)
                              : publishArticle(article._id)
                          }
                          disabled={isSubmitting}
                          className="rounded-xl border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-primary disabled:opacity-50"
                          aria-label={
                            article.isPublished ? "Unpublish article" : "Publish article"
                          }
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            article.featured
                              ? unfeatureArticle(article._id)
                              : featureArticle(article._id)
                          }
                          disabled={isSubmitting}
                          className="rounded-xl border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-secondary disabled:opacity-50"
                          aria-label={
                            article.featured ? "Unfeature article" : "Feature article"
                          }
                        >
                          <Star className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingArticle(article);
                            setModalMode("edit");
                          }}
                          className="rounded-xl border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          aria-label="Edit article"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(article)}
                          className="rounded-xl border border-border p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          aria-label="Delete article"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          Page {pagination.page} of {Math.max(pagination.pages, 1)} · {pagination.total} articles
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={pagination.page <= 1 || isLoading}
            onClick={() => fetchArticles({ page: pagination.page - 1 })}
            className="rounded-xl border border-border px-3 py-2 font-bold transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={pagination.page >= pagination.pages || isLoading}
            onClick={() => fetchArticles({ page: pagination.page + 1 })}
            className="rounded-xl border border-border px-3 py-2 font-bold transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {modalMode ? (
        <ArticleFormModal
          article={editingArticle}
          mode={modalMode}
          isSubmitting={isSubmitting}
          onClose={closeModal}
          onSubmit={saveArticle}
        />
      ) : null}

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-5 shadow-2xl">
            <h2 className="text-xl font-black text-foreground">Delete article?</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              This will remove “{deleteTarget.title}” from Knowledge Hub.
            </p>
            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-2xl border border-border px-4 py-2.5 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={async () => {
                  await deleteArticle(deleteTarget._id);
                  setDeleteTarget(null);
                }}
                className="rounded-2xl bg-destructive px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
