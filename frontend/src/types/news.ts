export interface NewsItem {
  id: string;
  title: string;
  summary: string | null;
  url: string | null;
  source: string | null;
  imageUrl: string | null;
  publishedAt: string;
  tags: string[];
}
