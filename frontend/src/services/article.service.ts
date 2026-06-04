import api from "../lib/api";

export interface Article {
  _id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  content: string;
  coverImage?: string;
  tags?: string[];
  keywords?: string[];
  readingTime?: number;
  author?: string;
  featured?: boolean;
  isPublished?: boolean;
  views?: number;
  bookmarksCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SimilarArticle {
  slug: string;
  title: string;
  category: string;
  summary: string;
  reading_time?: number;
  cover_image?: string;
  similarity_score?: number;
}

export type SimilarArticlesSource =
  | "tfidf-cosine-similarity"
  | "mongodb-fallback"
  | string;

export interface SimilarArticlesResponse {
  success: boolean;
  source: SimilarArticlesSource;
  recommendations: SimilarArticle[];
}

export interface ArticlePagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ArticleFilters {
  q?: string;
  category?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}

export interface ArticleSuggestion {
  label: string;
  type: "title" | "tag" | "keyword" | "category";
  slug: string;
  category: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const getArticles = async (filters: ArticleFilters = {}) => {
  const response = await api.get<
    ApiResponse<{ articles: Article[]; pagination: ArticlePagination }>
  >("/articles", {
    params: {
      q: filters.q || undefined,
      category: filters.category && filters.category !== "all" ? filters.category : undefined,
      featured: filters.featured,
      page: filters.page,
      limit: filters.limit,
    },
  });

  return response.data.data;
};

export const getArticle = async (slug: string) => {
  const response = await api.get<ApiResponse<{ article: Article }>>(
    `/articles/${slug}`
  );

  return response.data.data.article;
};

export const getSimilarArticles = async (slug: string) => {
  const response = await api.get<SimilarArticlesResponse>(
    `/articles/${slug}/similar`
  );

  return response.data;
};

export const getArticleSuggestions = async (query: string) => {
  const response = await api.get<
    ApiResponse<{ suggestions: ArticleSuggestion[] }>
  >("/articles/search/suggestions", {
    params: {
      q: query,
    },
  });

  return response.data.data.suggestions;
};
