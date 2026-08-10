// ─── Types ────────────────────────────────────────────────────────────────────

export type Message = {
  id: string;
  conversationId: string;
  /** 'me' when sent by the logged-in user, or the institution's id otherwise */
  senderId: string;
  content: string;
  createdAt: string; // ISO 8601
};

export type Conversation = {
  counterpartName?: string;
  displayName?: string;
  id: string;
  institutionId: string;
  institutionName: string;
  lastMessage: string;
  lastMessageAt: string; // ISO 8601
  unreadCount: number;
};
