export type PostAuthorType = 'USER' | 'INSTITUTION';
export type PostVisibility = 'PUBLIC' | 'FOLLOWERS_ONLY';
export type PostMediaType = 'IMAGE' | 'VIDEO' | 'FILE';

export type PostMedia = {
  type: PostMediaType;
  url: string;
};

export type PostStats = {
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
};

export type FeedPost = {
  id: string;
  authorType: PostAuthorType;
  authorId: string;
  campaignId?: string;
  institutionId?: string;
  content: string;
  media: PostMedia[];
  visibility: PostVisibility;
  stats: PostStats;
  createdAt: string;
  updatedAt: string;
};
