import { api } from '@/services/api';

import type {
  CreatePostCommentRequest,
  CreatePostReactionRequest,
  CreatePostRequest,
  FeedPost,
  PostComment,
  PostReaction,
} from './posts-types';

async function listFeed(token: string | null): Promise<FeedPost[]> {
  return api.get<FeedPost[]>('/posts/feed', { token });
}

async function createPost(body: CreatePostRequest, token: string | null): Promise<FeedPost> {
  return api.post<FeedPost, CreatePostRequest>('/posts', body, { token });
}

async function getPost(id: string, token: string | null): Promise<FeedPost> {
  return api.get<FeedPost>(`/posts/${id}`, { token });
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

export const postsService = {
  createComment,
  createPost,
  getPost,
  likePost,
  listFeed,
  listComments,
  unlikePost,
};
