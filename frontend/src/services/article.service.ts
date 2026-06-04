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

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

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
