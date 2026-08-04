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

export type CreatePostRequest = {
  authorType?: PostAuthorType;
  campaignId?: string;
  institutionId?: string;
  content: string;
  media?: PostMedia[];
  visibility?: PostVisibility;
};

export type PostComment = {
  id: string;
  postId: string;
  userId: string;
  parentCommentId?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type CreatePostCommentRequest = {
  postId: string;
  parentCommentId?: string;
  content: string;
};

export type PostReactionType = 'LIKE';

export type PostReaction = {
  id: string;
  postId: string;
  userId: string;
  type: PostReactionType;
  createdAt: string;
};

export type CreatePostReactionRequest = {
  postId: string;
  type?: PostReactionType;
};
