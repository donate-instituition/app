import { api, paginationQuery, type PaginatedResponse, unwrapPaginated } from '@/services/api';

import type {
  CreatePostCommentRequest,
  CreatePostReactionRequest,
  CreatePostRequest,
  FeedPost,
  PostComment,
  PostReaction,
  UpdatePostRequest,
} from './posts-types';

async function listFeed(token: string | null): Promise<FeedPost[]> {
  const response = await api.get<PaginatedResponse<FeedPost> | FeedPost[]>(
    '/posts/feed',
    { query: paginationQuery({ limit: 50 }), token },
  );
  return unwrapPaginated(response);
}

async function createPost(body: CreatePostRequest, token: string | null): Promise<FeedPost> {
  return api.post<FeedPost, CreatePostRequest>('/posts', body, { token });
}

async function getPost(id: string, token: string | null): Promise<FeedPost> {
  return api.get<FeedPost>(`/posts/${id}`, { token });
}

async function updatePost(
  id: string,
  body: UpdatePostRequest,
  token: string | null,
): Promise<FeedPost> {
  return api.patch<FeedPost, UpdatePostRequest>(`/posts/${id}`, body, { token });
}

async function listComments(postId: string, token: string | null): Promise<PostComment[]> {
  return api.get<PostComment[]>(`/post-comments/post/${postId}`, { token });
}

async function createComment(
  body: CreatePostCommentRequest,
  token: string | null,
): Promise<PostComment> {
  return api.post<PostComment, CreatePostCommentRequest>('/post-comments', body, { token });
}

async function likePost(
  body: CreatePostReactionRequest,
  token: string | null,
): Promise<PostReaction> {
  return api.post<PostReaction, CreatePostReactionRequest>(
    '/post-reactions',
    { ...body, type: body.type ?? 'LIKE' },
    { token },
  );
}

async function unlikePost(postId: string, token: string | null): Promise<{ postId: string }> {
  return api.delete<{ postId: string }>(`/post-reactions/post/${postId}`, { token });
}

async function sharePost(postId: string): Promise<{ postId: string; sharesCount: number }> {
  return api.post<{ postId: string; sharesCount: number }>(`/posts/${postId}/share`);
}

async function getMyLikedPostIds(token: string | null): Promise<string[]> {
  return api.get<string[]>('/post-reactions/me', { token });
}

export const postsService = {
  createComment,
  createPost,
  getMyLikedPostIds,
  getPost,
  likePost,
  listFeed,
  listComments,
  sharePost,
  unlikePost,
  updatePost,
};
