import { api } from '@/services/api';

import type { FeedPost } from './posts-types';

async function listFeed(token: string | null): Promise<FeedPost[]> {
  return api.get<FeedPost[]>('/posts/feed', { token });
}

export const postsService = {
  listFeed,
};
