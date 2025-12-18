export interface NewsArticle {
  id: number;
  title: string;
  content: string;
  header_image?: string | null;
  asset_id?: number | null;
  news_type_id?: number | null;
  news_type?: string | null;
  summary?: string | null;
  author?: string | null;
  imageUrl?: string | null;
  category?: string | null;
  tags?: string[] | null;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: any;
}

export type NewsArray = NewsArticle[];

// Backend detail response shape
export interface NewsDetailResponse {
  success: boolean;
  data: {
    id: number;
    title: string;
    content: string;
    author?: string | null;
    news_type_id?: number | null;
    created_at?: string | null;
    updated_at?: string | null;
    header_image?: string | null;
    asset_id?: number | null;
    news_type?: string | null;
    [key: string]: any;
  };
}
