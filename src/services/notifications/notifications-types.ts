export type AppNotificationType =
  | 'DONATION_STATUS_UPDATED'
  | 'NEW_FOLLOWER'
  | 'NEW_MESSAGE'
  | 'CAMPAIGN_UPDATE';

export type AppNotification = {
  id: string;
  userId: string;
  type: AppNotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  readAt?: string;
  createdAt: string;
};
