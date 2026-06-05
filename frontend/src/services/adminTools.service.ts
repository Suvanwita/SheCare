import api from "../lib/api";

export type AdminToolAction =
  | "seed-doctors"
  | "seed-articles"
  | "export-articles-csv"
  | "refresh-article-trie"
  | "retrain-article-recommender";

export interface AdminToolsStatus {
  mongodb: {
    status: string;
    readyState: number;
    database: string | null;
  };
  counts: {
    articleCount: number;
    doctorCount: number;
  };
  services: {
    articleMlServiceUrl: string;
    pcosMlServiceUrl: string | null;
    cycleMlServiceUrl: string | null;
  };
  articleServiceHealth: {
    reachable: boolean;
    statusCode?: number;
    message?: string;
    data?: Record<string, unknown>;
  };
}

export interface AdminToolResult {
  success: boolean;
  message: string;
  data?: {
    count?: number;
    path?: string;
    refreshed?: boolean;
    available?: boolean;
    [key: string]: unknown;
  };
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const actionEndpoints: Record<AdminToolAction, string> = {
  "seed-doctors": "/admin/tools/seed-doctors",
  "seed-articles": "/admin/tools/seed-articles",
  "export-articles-csv": "/admin/tools/export-articles-csv",
  "refresh-article-trie": "/admin/tools/refresh-article-trie",
  "retrain-article-recommender": "/admin/tools/retrain-article-recommender",
};

export const getAdminToolsStatus = async () => {
  const response = await api.get<ApiResponse<AdminToolsStatus>>(
    "/admin/tools/status"
  );

  return response.data.data;
};

export const runAdminTool = async (action: AdminToolAction) => {
  const response = await api.post<AdminToolResult>(actionEndpoints[action]);

  return response.data;
};
