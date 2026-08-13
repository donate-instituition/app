import { api } from '@/services/api';

import type { CreateFollowRequest, Follow, FollowTargetType } from './follows-types';

async function follow(body: CreateFollowRequest, token: string | null): Promise<Follow> {
  return api.post<Follow, CreateFollowRequest>('/follows', body, { token });
}

async function listMyFollows(token: string | null): Promise<Follow[]> {
  return api.get<Follow[]>('/follows/me', { token });
}

async function unfollow(
  targetType: FollowTargetType,
  targetId: string,
  token: string | null,
): Promise<{ targetType: string; targetId: string }> {
  return api.delete<{ targetType: string; targetId: string }>(
    `/follows/${targetType}/${targetId}`,
    { token },
  );
}

export const followsService = {
  follow,
  listMyFollows,
  unfollow,
};
