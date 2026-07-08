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

import { MOCK_ARTICLES } from "../data/mockArticles";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

const getMockArticlesResult = (filters: ArticleFilters) => {
  let filtered = [...MOCK_ARTICLES];
  
  if (filters.q) {
    const q = filters.q.toLowerCase();
    filtered = filtered.filter(
      (art) =>
        art.title.toLowerCase().includes(q) ||
        art.summary.toLowerCase().includes(q) ||
        art.content.toLowerCase().includes(q) ||
        (art.tags && art.tags.some((t) => t.toLowerCase().includes(q))) ||
        (art.keywords && art.keywords.some((k) => k.toLowerCase().includes(q)))
    );
  }
  
  if (filters.category && filters.category !== "all") {
    filtered = filtered.filter((art) => art.category === filters.category);
  }
  
  if (filters.featured !== undefined) {
    filtered = filtered.filter((art) => art.featured === filters.featured);
  }
  
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const total = filtered.length;
  const pages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);
  
  return {
    articles: paginated,
    pagination: {
      page,
      limit,
      total,
      pages
    }
  };
};

export const getArticles = async (filters: ArticleFilters = {}) => {
  try {
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

    const result = response.data.data;
    if (result && result.articles && result.articles.length > 0) {
      return result;
    }
    
    console.warn("API returned empty articles list, falling back to mock articles");
    return getMockArticlesResult(filters);
  } catch (error) {
    console.warn("Backend API failed, falling back to mock articles:", error);
    return getMockArticlesResult(filters);
  }
};

export const getArticle = async (slug: string) => {
  try {
    const response = await api.get<ApiResponse<{ article: Article }>>(
      `/articles/${slug}`
    );

    return response.data.data.article;
  } catch (error) {
    console.warn(`Backend API failed, falling back to mock article ${slug}:`, error);
    const found = MOCK_ARTICLES.find((art) => art.slug === slug);
    if (!found) {
      throw new Error(`Article with slug "${slug}" not found in mock database.`);
    }
    return found;
  }
};

export const getSimilarArticles = async (slug: string) => {
  try {
    const response = await api.get<SimilarArticlesResponse>(
      `/articles/${slug}/similar`
    );

    return response.data;
  } catch (error) {
    console.warn(`Backend API failed, falling back to mock similar articles for ${slug}:`, error);
    const current = MOCK_ARTICLES.find((art) => art.slug === slug);
    if (!current) {
      return {
        success: true,
        source: "mock-fallback",
        recommendations: []
      };
    }
    
    const matches = MOCK_ARTICLES.filter(
      (art) => art.category === current.category && art.slug !== slug
    );
    
    const recommendations = matches.map((art) => ({
      slug: art.slug,
      title: art.title,
      category: art.category,
      summary: art.summary,
      reading_time: art.readingTime,
      cover_image: art.coverImage,
      similarity_score: 0.85
    }));
    
    return {
      success: true,
      source: "mongodb-fallback",
      recommendations: recommendations.slice(0, 3)
    };
  }
};

const getMockSuggestions = (query: string): ArticleSuggestion[] => {
  const q = query.toLowerCase();
  const suggestions: ArticleSuggestion[] = [];
  
  MOCK_ARTICLES.forEach((art) => {
    if (art.title.toLowerCase().includes(q)) {
      suggestions.push({
        label: art.title,
        type: "title",
        slug: art.slug,
        category: art.category
      });
    }
    if (art.category.toLowerCase().includes(q)) {
      suggestions.push({
        label: art.category,
        type: "category",
        slug: art.slug,
        category: art.category
      });
    }
  });
  
  const seen = new Set();
  return suggestions.filter((s) => {
    if (seen.has(s.label)) return false;
    seen.add(s.label);
    return true;
  }).slice(0, 5);
};

export const getArticleSuggestions = async (query: string) => {
  try {
    const response = await api.get<
      ApiResponse<{ suggestions: ArticleSuggestion[] }>
    >("/articles/search/suggestions", {
      params: {
        q: query,
      },
    });

    const result = response.data.data.suggestions;
    if (result && result.length > 0) {
      return result;
    }
    
    console.warn(`API returned empty suggestions list, falling back to mock suggestions for "${query}"`);
    return getMockSuggestions(query);
  } catch (error) {
    console.warn(`Backend API failed, falling back to mock article suggestions for "${query}":`, error);
    return getMockSuggestions(query);
  }
};
