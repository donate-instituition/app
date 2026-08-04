import { io, type Socket } from 'socket.io-client';

import { api } from '@/services/api';
import { API_BASE_URL } from '@/services/api/config';
import { logger } from '@/services/logger';

import type { Conversation, Message } from './chat-types';

type EnsureConversationResponse = Conversation;

type UnreadListener = () => void;
type MessageListener = (message: Message) => void;
type ConversationListener = (conversation: Conversation) => void;
type UnreadUpdatePayload = {
  conversationId: string;
  unreadCount: number;
  updatedCount?: number;
};

const unreadListeners = new Set<UnreadListener>();
const conversationListeners = new Set<ConversationListener>();
const messageListeners = new Map<string, Set<MessageListener>>();
const chatLogger = logger.child('ChatSocket');
let cachedConversations: Conversation[] = [];
let socket: Socket | null = null;
let socketToken: string | null | undefined;

function notifyUnreadChange() {
  unreadListeners.forEach((listener) => listener());
}

function notifyConversationChange(conversation: Conversation) {
  conversationListeners.forEach((listener) => listener(conversation));
}

function notifyMessageChange(message: Message) {
  messageListeners.get(message.conversationId)?.forEach((listener) => {
    listener(message);
  });
}

export function subscribeUnreadChanges(listener: UnreadListener): () => void {
  unreadListeners.add(listener);
  return () => unreadListeners.delete(listener);
}

export function subscribeConversationChanges(
  listener: ConversationListener,
): () => void {
  conversationListeners.add(listener);
  return () => conversationListeners.delete(listener);
}

export function subscribeConversationMessages(
  conversationId: string,
  listener: MessageListener,
): () => void {
  const listeners = messageListeners.get(conversationId) ?? new Set<MessageListener>();
  listeners.add(listener);
  messageListeners.set(conversationId, listeners);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      messageListeners.delete(conversationId);
    }
  };
}

function setCachedConversations(conversations: Conversation[]) {
  cachedConversations = conversations;
  notifyUnreadChange();
}

function upsertCachedConversation(conversation: Conversation) {
  cachedConversations = [
    conversation,
    ...cachedConversations.filter((item) => item.id !== conversation.id),
  ].sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
  );
  notifyConversationChange(conversation);
  notifyUnreadChange();
}

function getSocketUrl() {
  return `${API_BASE_URL.replace(/\/$/, '')}/chat`;
}

function connect(token?: string | null) {
  if (!token) {
    disconnect();
    return;
  }

  if (socket?.connected && socketToken === token) {
    return;
  }

  disconnect();

  socketToken = token;
  socket = io(getSocketUrl(), {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 700,
    reconnectionDelayMax: 4000,
  });

  socket.on('connect', () => {
    chatLogger.info('Connected', { id: socket?.id });
  });
  socket.on('disconnect', (reason) => {
    chatLogger.warn('Disconnected', { reason });
  });
  socket.on('connect_error', (error) => {
    chatLogger.error('Connection error', { message: error.message });
  });
  socket.on('conversation:updated', (conversation: Conversation) => {
    upsertCachedConversation(conversation);
  });
  socket.on('message:new', (message: Message) => {
    notifyMessageChange(message);
  });
  socket.on('unread:update', (payload: UnreadUpdatePayload) => {
    cachedConversations = cachedConversations.map((conversation) =>
      conversation.id === payload.conversationId
        ? { ...conversation, unreadCount: payload.unreadCount }
        : conversation,
    );
    notifyUnreadChange();
  });
}

function disconnect() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
  socketToken = null;
}

async function listConversations(token?: string | null): Promise<Conversation[]> {
  connect(token);
  const conversations = await api.get<Conversation[]>('/conversations/me', { token });
  setCachedConversations(conversations);
  return conversations;
}

async function ensureConversation(
  institutionId: string,
  _institutionName?: string,
  token?: string | null,
  campaignId?: string,
): Promise<string> {
  connect(token);
  const conversation = await api.post<EnsureConversationResponse>(
    '/conversations/ensure',
    {
      institutionId,
      campaignId,
    },
    { token },
  );

  upsertCachedConversation(conversation);

  return conversation.id;
}

async function ensureSupportConversation(token?: string | null): Promise<string> {
  connect(token);
  const conversation = await api.post<EnsureConversationResponse>(
    '/conversations/ensure',
    { support: true },
    { token },
  );

  upsertCachedConversation(conversation);

  return conversation.id;
}

async function getConversation(
  conversationId: string,
  token?: string | null,
): Promise<Conversation | undefined> {
  connect(token);
  const cached = cachedConversations.find((item) => item.id === conversationId);

  if (cached) {
    return cached;
  }

  return api.get<Conversation>(`/conversations/${conversationId}`, { token });
}

async function getMessages(
  conversationId: string,
  token?: string | null,
): Promise<Message[]> {
  connect(token);
  return api.get<Message[]>(`/conversations/${conversationId}/messages`, { token });
}

async function sendMessage(
  conversationId: string,
  content: string,
  _senderId?: string,
  token?: string | null,
): Promise<Message> {
  connect(token);
  const message = await api.post<Message>(
    `/conversations/${conversationId}/messages`,
    { content },
    { token },
  );

  return message;
}

async function markAsRead(
  conversationId: string,
  token?: string | null,
): Promise<void> {
  connect(token);
  await api.post(`/conversations/${conversationId}/read`, undefined, { token });
  const hadUnread = cachedConversations.some(
    (conversation) => conversation.id === conversationId && conversation.unreadCount > 0,
  );

  if (hadUnread) {
    cachedConversations = cachedConversations.map((conversation) =>
      conversation.id === conversationId
        ? { ...conversation, unreadCount: 0 }
        : conversation,
    );
    notifyUnreadChange();
  }
}

function getTotalUnread(): number {
  return cachedConversations.reduce(
    (total, conversation) => total + conversation.unreadCount,
    0,
  );
}

export const chatService = {
  listConversations,
  getConversation,
  getMessages,
  sendMessage,
  markAsRead,
  getTotalUnread,
  connect,
  disconnect,
  ensureConversation,
  ensureSupportConversation,
};
