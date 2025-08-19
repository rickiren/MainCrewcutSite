export interface NicheConfig {
  name: string;
  filters: {
    keywords: string[];
    minEmployees?: number;
    minRevenueUSD?: number;
    geo?: string[];
  };
  examples?: string[];
}

export interface PostItem {
  id: string;
  url: string;
  text: string;
  createdAtISO: string;
  likeCount: number;
  commentCount: number;
  authorName?: string;
  authorTitle?: string;
  authorCompany?: string;
  authorEmployees?: number;
}

export interface CommentJob {
  kind: "COMMENT";
  postId: string;
}

export interface QueueItem {
  id: string;
  kind: "COMMENT";
  payload: CommentJob;
  runAfter: number;
  status: "queued" | "running" | "done" | "error";
}
