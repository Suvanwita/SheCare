import { AxiosError } from "axios";
import { create } from "zustand";
import * as adminArticleService from "../services/adminArticle.service";
import type { Article, ArticlePagination } from "../services/article.service";
import type {
  AdminArticleFilters,
  AdminArticlePayload,
} from "../services/adminArticle.service";

interface AdminArticleState {
  articles: Article[];
  pagination: ArticlePagination;
  filters: AdminArticleFilters;
  isLoading: boolean;
  isSubmitting: boolean;
  isToolRunning: boolean;
  error: string | null;
  toolMessage: string | null;
  fetchArticles: (filters?: AdminArticleFilters) => Promise<void>;
  createArticle: (payload: AdminArticlePayload) => Promise<void>;
  updateArticle: (id: string, payload: Partial<AdminArticlePayload>) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;
  publishArticle: (id: string) => Promise<void>;
  unpublishArticle: (id: string) => Promise<void>;
  featureArticle: (id: string) => Promise<void>;
  unfeatureArticle: (id: string) => Promise<void>;
  refreshSearch: () => Promise<void>;
  exportCsv: () => Promise<void>;
  retrainRecommender: () => Promise<void>;
  clearError: () => void;
}

const defaultPagination: ArticlePagination = {
  page: 1,
  limit: 10,
  total: 0,
  pages: 0,
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    return error.response?.data?.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

export const useAdminArticleStore = create<AdminArticleState>((set, get) => ({
  articles: [],
  pagination: defaultPagination,
  filters: {
    page: 1,
    limit: 10,
    category: "all",
    isPublished: "all",
    featured: "all",
  },
  isLoading: false,
  isSubmitting: false,
  isToolRunning: false,
  error: null,
  toolMessage: null,

  fetchArticles: async (filters = {}) => {
    const nextFilters = {
      ...get().filters,
      ...filters,
    };

    set({ isLoading: true, error: null, filters: nextFilters });

    try {
      const data = await adminArticleService.getAdminArticles(nextFilters);
      set({
        articles: data.articles,
        pagination: data.pagination,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: getErrorMessage(error, "Unable to fetch admin articles."),
        isLoading: false,
      });
    }
  },

  createArticle: async (payload) => {
    set({ isSubmitting: true, error: null });

    try {
      await adminArticleService.createAdminArticle(payload);
      set({ isSubmitting: false });
      await get().fetchArticles();
    } catch (error) {
      const message = getErrorMessage(error, "Unable to create article.");
      set({ error: message, isSubmitting: false });
      throw new Error(message);
    }
  },

  updateArticle: async (id, payload) => {
    set({ isSubmitting: true, error: null });

    try {
      await adminArticleService.updateAdminArticle(id, payload);
      set({ isSubmitting: false });
      await get().fetchArticles();
    } catch (error) {
      const message = getErrorMessage(error, "Unable to update article.");
      set({ error: message, isSubmitting: false });
      throw new Error(message);
    }
  },

  deleteArticle: async (id) => {
    set({ isSubmitting: true, error: null });

    try {
      await adminArticleService.deleteAdminArticle(id);
      set({ isSubmitting: false });
      await get().fetchArticles();
    } catch (error) {
      const message = getErrorMessage(error, "Unable to delete article.");
      set({ error: message, isSubmitting: false });
      throw new Error(message);
    }
  },

  publishArticle: async (id) => {
    set({ isSubmitting: true, error: null });

    try {
      await adminArticleService.publishAdminArticle(id);
      set({ isSubmitting: false });
      await get().fetchArticles();
    } catch (error) {
      const message = getErrorMessage(error, "Unable to publish article.");
      set({ error: message, isSubmitting: false });
      throw new Error(message);
    }
  },

  unpublishArticle: async (id) => {
    set({ isSubmitting: true, error: null });

    try {
      await adminArticleService.unpublishAdminArticle(id);
      set({ isSubmitting: false });
      await get().fetchArticles();
    } catch (error) {
      const message = getErrorMessage(error, "Unable to unpublish article.");
      set({ error: message, isSubmitting: false });
      throw new Error(message);
    }
  },

  featureArticle: async (id) => {
    set({ isSubmitting: true, error: null });

    try {
      await adminArticleService.featureAdminArticle(id);
      set({ isSubmitting: false });
      await get().fetchArticles();
    } catch (error) {
      const message = getErrorMessage(error, "Unable to feature article.");
      set({ error: message, isSubmitting: false });
      throw new Error(message);
    }
  },

  unfeatureArticle: async (id) => {
    set({ isSubmitting: true, error: null });

    try {
      await adminArticleService.unfeatureAdminArticle(id);
      set({ isSubmitting: false });
      await get().fetchArticles();
    } catch (error) {
      const message = getErrorMessage(error, "Unable to unfeature article.");
      set({ error: message, isSubmitting: false });
      throw new Error(message);
    }
  },

  refreshSearch: async () => {
    set({ isToolRunning: true, error: null, toolMessage: null });

    try {
      const response = await adminArticleService.refreshAdminArticleSearch();
      set({ isToolRunning: false, toolMessage: response.message });
    } catch (error) {
      set({
        error: getErrorMessage(error, "Unable to refresh article search."),
        isToolRunning: false,
      });
    }
  },

  exportCsv: async () => {
    set({ isToolRunning: true, error: null, toolMessage: null });

    try {
      const response = await adminArticleService.exportAdminArticlesCsv();
      set({ isToolRunning: false, toolMessage: response.message });
    } catch (error) {
      set({
        error: getErrorMessage(error, "Unable to export article CSV."),
        isToolRunning: false,
      });
    }
  },

  retrainRecommender: async () => {
    set({ isToolRunning: true, error: null, toolMessage: null });

    try {
      const response = await adminArticleService.retrainAdminArticleRecommender();
      set({ isToolRunning: false, toolMessage: response.message });
    } catch (error) {
      set({
        error: getErrorMessage(error, "Unable to retrain article recommender."),
        isToolRunning: false,
      });
    }
  },

  clearError: () => {
    set({ error: null, toolMessage: null });
  },
}));
