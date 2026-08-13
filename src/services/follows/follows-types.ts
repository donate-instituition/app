export type FollowTargetType = 'INSTITUTION' | 'CAMPAIGN' | 'USER';

export type Follow = {
  id: string;
  followerUserId: string;
  targetType: FollowTargetType;
  targetId: string;
  createdAt: string;
};

export type CreateFollowRequest = {
  targetType: FollowTargetType;
  targetId: string;
};
