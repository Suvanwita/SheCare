import api from "../lib/api";
import type { Article, ArticlePagination } from "./article.service";

export interface AdminArticleFilters {
  search?: string;
  category?: string;
  isPublished?: "all" | "true" | "false";
  featured?: "all" | "true" | "false";
  page?: number;
  limit?: number;
}

export interface AdminArticlePayload {
  title: string;
  slug?: string;
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
}

export interface AdminArticleToolResult {
  count?: number;
  path?: string;
  refreshed?: boolean;
  available?: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const getAdminArticles = async (filters: AdminArticleFilters = {}) => {
  const response = await api.get<
    ApiResponse<{ articles: Article[]; pagination: ArticlePagination }>
  >("/admin/articles", {
    params: {
      search: filters.search || undefined,
      category:
        filters.category && filters.category !== "all" ? filters.category : undefined,
      isPublished:
        filters.isPublished && filters.isPublished !== "all"
          ? filters.isPublished
          : undefined,
      featured:
        filters.featured && filters.featured !== "all" ? filters.featured : undefined,
      page: filters.page,
      limit: filters.limit,
    },
  });

  return response.data.data;
};

export const createAdminArticle = async (payload: AdminArticlePayload) => {
  const response = await api.post<ApiResponse<{ article: Article }>>(
    "/admin/articles",
    payload
  );
  return response.data.data.article;
};

export const updateAdminArticle = async (
  id: string,
  payload: Partial<AdminArticlePayload>
) => {
  const response = await api.patch<ApiResponse<{ article: Article }>>(
    `/admin/articles/${id}`,
    payload
  );
  return response.data.data.article;
};

export const deleteAdminArticle = async (id: string) => {
  await api.delete<ApiResponse<{ id: string }>>(`/admin/articles/${id}`);
};

export const publishAdminArticle = async (id: string) => {
  const response = await api.patch<ApiResponse<{ article: Article }>>(
    `/admin/articles/${id}/publish`
  );
  return response.data.data.article;
};

export const unpublishAdminArticle = async (id: string) => {
  const response = await api.patch<ApiResponse<{ article: Article }>>(
    `/admin/articles/${id}/unpublish`
  );
  return response.data.data.article;
};

export const featureAdminArticle = async (id: string) => {
  const response = await api.patch<ApiResponse<{ article: Article }>>(
    `/admin/articles/${id}/feature`
  );
  return response.data.data.article;
};

export const unfeatureAdminArticle = async (id: string) => {
  const response = await api.patch<ApiResponse<{ article: Article }>>(
    `/admin/articles/${id}/unfeature`
  );
  return response.data.data.article;
};

export const refreshAdminArticleSearch = async () => {
  const response = await api.post<ApiResponse<AdminArticleToolResult>>(
    "/admin/articles/refresh-search"
  );
  return response.data;
};

export const exportAdminArticlesCsv = async () => {
  const response = await api.post<ApiResponse<AdminArticleToolResult>>(
    "/admin/articles/export-csv"
  );
  return response.data;
};

export const retrainAdminArticleRecommender = async () => {
  const response = await api.post<ApiResponse<AdminArticleToolResult>>(
    "/admin/articles/retrain-recommender"
  );
  return response.data;
};
