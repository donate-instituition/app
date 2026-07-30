/**
 * Chat Service — Mock implementation.
 *
 * Stores all state in-memory. Replace each method body with the corresponding
 * real-time API / WebSocket call when the back-end is ready.
 *
 * Conversation ID convention: `conv-${institutionId}`
 * This makes it deterministic — tapping "Conversar" on an institution always
 * opens the same thread, regardless of the entry point (campaign or institution detail).
 */

import type { Conversation, Message } from './chat-types';

// ─── Dev flags ────────────────────────────────────────────────────────────────

const SIMULATE_DELAY_MS = 300;

// ─── Reply banks per institution ──────────────────────────────────────────────

const REPLY_BANKS: Record<string, string[]> = {
  'inst-1': [
    'Obrigado pelo contato! Estamos aqui para ajudar 😊',
    'Ficamos muito felizes com seu apoio! Cada doação faz a diferença.',
    'Nossa campanha está indo muito bem graças a pessoas como você!',
    'Tem alguma dúvida sobre como os recursos são utilizados? Estamos à disposição.',
    'Sua generosidade vai mudar a vida de muitas crianças! 💚',
    'Enviamos um e-mail com o recibo da sua doação. Verifique sua caixa de entrada!',
  ],
  'inst-2': [
    'Olá! Obrigado pelo contato com o Lar Aconchego 🙏',
    'Sua doação vai ajudar a alimentar famílias neste inverno.',
    'As cestas básicas serão distribuídas na próxima semana.',
    'Agradecemos imensamente o apoio! Você faz parte da nossa família.',
    'Juntos, podemos garantir que nenhuma família passe fome! 💪',
    'Também aceitamos doações de alimentos não perecíveis de segunda a sexta.',
  ],
  'inst-3': [
    'Obrigado por entrar em contato com a Saúde Para Todos!',
    'Sua doação vai garantir atendimento médico gratuito para comunidades carentes.',
    'Temos conseguido atender centenas de pessoas graças ao apoio de doadores como você.',
    'Qualquer dúvida sobre nossa campanha, estamos à disposição!',
    'O próximo mutirão de saúde será em agosto. Fique ligado!',
  ],
  'inst-4': [
    'Olá! A Verde Futuro agradece seu interesse! 🌿',
    'Cada real doado planta uma árvore nativa. Você está ajudando o planeta!',
    'Nosso projeto de reflorestamento já plantou mais de 2.000 árvores este ano.',
    'Juntos, vamos construir um futuro mais verde para todos! 🌳',
    'Você sabia que uma árvore nativa absorve até 22kg de CO₂ por ano?',
  ],
  'inst-5': [
    'Olá! Obrigado por entrar em contato com a Casa Esperança.',
    'Sua ajuda vai garantir que famílias tenham um lar seguro e digno.',
    'Estamos reformando o abrigo e sua contribuição é fundamental.',
    'Cada tijolo assentado representa esperança para quem mais precisa! 🏠',
    'As obras estão em andamento e devem ser concluídas em dezembro.',
  ],
};

const DEFAULT_REPLIES = [
  'Olá! Obrigado pelo contato. Em que podemos ajudar?',
  'Recebemos sua mensagem e retornaremos em breve!',
  'Agradecemos seu interesse em nossa causa 🙏',
  'Sua mensagem é muito importante para nós!',
];

// ─── Mock data ────────────────────────────────────────────────────────────────

let mockConversations: Conversation[] = [
  {
    id: 'conv-inst-1',
    institutionId: 'inst-1',
    institutionName: 'Educação Viva',
    lastMessage: 'Você faz parte da transformação na vida dessas crianças! 💚',
    lastMessageAt: '2026-07-30T10:33:00Z',
    unreadCount: 2,
  },
  {
    id: 'conv-inst-2',
    institutionId: 'inst-2',
    institutionName: 'Lar Aconchego',
    lastMessage: 'Olá! Sua doação está sendo processada...',
    lastMessageAt: '2026-07-29T14:15:00Z',
    unreadCount: 0,
  },
  {
    id: 'conv-inst-3',
    institutionId: 'inst-3',
    institutionName: 'Saúde Para Todos',
    lastMessage: 'O próximo mutirão de saúde será em agosto. Fique ligado!',
    lastMessageAt: '2026-07-28T09:00:00Z',
    unreadCount: 1,
  },
  {
    id: 'conv-inst-4',
    institutionId: 'inst-4',
    institutionName: 'Verde Futuro',
    lastMessage: 'Sua doação vai plantar 24 árvores nativas 🌱',
    lastMessageAt: '2026-07-25T16:45:00Z',
    unreadCount: 0,
  },
];

const mockMessages: Record<string, Message[]> = {
  'conv-inst-1': [
    {
      id: 'msg-1-1',
      conversationId: 'conv-inst-1',
      senderId: 'me',
      content: 'Olá! Gostaria de saber mais sobre a campanha de Material Escolar.',
      createdAt: '2026-07-29T09:00:00Z',
    },
    {
      id: 'msg-1-2',
      conversationId: 'conv-inst-1',
      senderId: 'inst-1',
      content: 'Olá! Ficamos felizes com seu interesse 😊 A campanha visa fornecer material escolar completo para 200 crianças de escolas públicas.',
      createdAt: '2026-07-29T09:05:00Z',
    },
    {
      id: 'msg-1-3',
      conversationId: 'conv-inst-1',
      senderId: 'inst-1',
      content: 'Cada kit custa R$ 25,00 e garante que a criança chegue ao primeiro dia de aula preparada.',
      createdAt: '2026-07-29T09:06:00Z',
    },
    {
      id: 'msg-1-4',
      conversationId: 'conv-inst-1',
      senderId: 'me',
      content: 'Que incrível! Acabei de fazer uma doação para a campanha.',
      createdAt: '2026-07-30T10:20:00Z',
    },
    {
      id: 'msg-1-5',
      conversationId: 'conv-inst-1',
      senderId: 'inst-1',
      content: 'Sua doação chegou! Muito obrigado pelo apoio.',
      createdAt: '2026-07-30T10:32:00Z',
    },
    {
      id: 'msg-1-6',
      conversationId: 'conv-inst-1',
      senderId: 'inst-1',
      content: 'Você faz parte da transformação na vida dessas crianças! 💚',
      createdAt: '2026-07-30T10:33:00Z',
    },
  ],
  'conv-inst-2': [
    {
      id: 'msg-2-1',
      conversationId: 'conv-inst-2',
      senderId: 'me',
      content: 'Boa tarde! Vocês aceitam doações de alimentos além de dinheiro?',
      createdAt: '2026-07-29T14:10:00Z',
    },
    {
      id: 'msg-2-2',
      conversationId: 'conv-inst-2',
      senderId: 'inst-2',
      content: 'Olá! Sim, aceitamos doações de alimentos não perecíveis. Pode nos trazer de segunda a sexta, das 8h às 17h.',
      createdAt: '2026-07-29T14:12:00Z',
    },
    {
      id: 'msg-2-3',
      conversationId: 'conv-inst-2',
      senderId: 'me',
      content: 'Ótimo, vou levar alguns itens na próxima semana!',
      createdAt: '2026-07-29T14:14:00Z',
    },
    {
      id: 'msg-2-4',
      conversationId: 'conv-inst-2',
      senderId: 'inst-2',
      content: 'Olá! Sua doação está sendo processada...',
      createdAt: '2026-07-29T14:15:00Z',
    },
  ],
  'conv-inst-3': [
    {
      id: 'msg-3-1',
      conversationId: 'conv-inst-3',
      senderId: 'inst-3',
      content: 'Atualizamos a meta da campanha de Mutirão de Saúde. Confira os novos detalhes!',
      createdAt: '2026-07-28T08:55:00Z',
    },
    {
      id: 'msg-3-2',
      conversationId: 'conv-inst-3',
      senderId: 'inst-3',
      content: 'O próximo mutirão de saúde será em agosto. Fique ligado!',
      createdAt: '2026-07-28T09:00:00Z',
    },
  ],
  'conv-inst-4': [
    {
      id: 'msg-4-1',
      conversationId: 'conv-inst-4',
      senderId: 'me',
      content: 'Parabéns pelo projeto de reflorestamento! Uma iniciativa incrível.',
      createdAt: '2026-07-25T16:30:00Z',
    },
    {
      id: 'msg-4-2',
      conversationId: 'conv-inst-4',
      senderId: 'inst-4',
      content: 'Obrigado! Estamos muito empolgados com o projeto. 🌱',
      createdAt: '2026-07-25T16:40:00Z',
    },
    {
      id: 'msg-4-3',
      conversationId: 'conv-inst-4',
      senderId: 'inst-4',
      content: 'Sua doação vai plantar 24 árvores nativas 🌱',
      createdAt: '2026-07-25T16:45:00Z',
    },
  ],
};

// ─── Unread change subscribers ────────────────────────────────────────────────

type UnreadListener = () => void;
const unreadListeners = new Set<UnreadListener>();

function notifyUnreadChange() {
  unreadListeners.forEach((listener) => listener());
}

/** Subscribe to unread-count changes (e.g. tab badge). Returns an unsubscribe fn. */
export function subscribeUnreadChanges(listener: UnreadListener): () => void {
  unreadListeners.add(listener);
  return () => unreadListeners.delete(listener);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function pickReply(institutionId: string): string {
  const bank = REPLY_BANKS[institutionId] ?? DEFAULT_REPLIES;
  return bank[Math.floor(Math.random() * bank.length)];
}

/**
 * Opens (or creates) a conversation thread for an institution.
 * Call this before navigating so the thread has the correct institution name.
 */
function ensureConversation(institutionId: string, institutionName: string): string {
  const conversationId = `conv-${institutionId}`;
  const existing = mockConversations.find((c) => c.id === conversationId);

  if (existing) {
    if (existing.institutionName !== institutionName) {
      mockConversations = mockConversations.map((c) =>
        c.id === conversationId ? { ...c, institutionName } : c
      );
    }
    return conversationId;
  }

  const newConv: Conversation = {
    id: conversationId,
    institutionId,
    institutionName,
    lastMessage: '',
    lastMessageAt: new Date().toISOString(),
    unreadCount: 0,
  };
  mockConversations = [newConv, ...mockConversations];
  mockMessages[conversationId] = [];
  return conversationId;
}

/** Ensures a conversation exists for the given ID, creating one if not. */
function getOrCreateConversation(conversationId: string, institutionName?: string): Conversation {
  const institutionId = conversationId.replace('conv-', '');
  if (institutionName) {
    ensureConversation(institutionId, institutionName);
    return mockConversations.find((c) => c.id === conversationId)!;
  }

  const existing = mockConversations.find((c) => c.id === conversationId);
  if (existing) return existing;

  return mockConversations.find(
    (c) => c.id === ensureConversation(institutionId, 'Instituição')
  )!;
}

// ─── Service ──────────────────────────────────────────────────────────────────

async function listConversations(): Promise<Conversation[]> {
  await delay(SIMULATE_DELAY_MS);
  return [...mockConversations].sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );
}

function getConversation(conversationId: string): Conversation | undefined {
  return mockConversations.find((c) => c.id === conversationId);
}

function getMessages(conversationId: string): Message[] {
  // Ensure conversation exists so getOrCreate runs first
  getOrCreateConversation(conversationId);
  return [...(mockMessages[conversationId] ?? [])];
}

function sendMessage(conversationId: string, content: string, senderId: string): Message {
  getOrCreateConversation(conversationId);
  const message: Message = {
    id: `msg-${Date.now()}`,
    conversationId,
    senderId,
    content,
    createdAt: new Date().toISOString(),
  };
  if (!mockMessages[conversationId]) {
    mockMessages[conversationId] = [];
  }
  mockMessages[conversationId] = [...mockMessages[conversationId], message];
  mockConversations = mockConversations.map((c) =>
    c.id === conversationId
      ? { ...c, lastMessage: content, lastMessageAt: message.createdAt }
      : c
  );
  return message;
}

/**
 * Simulates an automated reply from the institution.
 * Call this after a timeout to create a realistic chat experience.
 */
function simulateReply(conversationId: string): Message | null {
  const conv = getOrCreateConversation(conversationId);
  const content = pickReply(conv.institutionId);
  const reply: Message = {
    id: `msg-${Date.now()}-reply`,
    conversationId,
    senderId: conv.institutionId,
    content,
    createdAt: new Date().toISOString(),
  };
  mockMessages[conversationId] = [...(mockMessages[conversationId] ?? []), reply];
  mockConversations = mockConversations.map((c) =>
    c.id === conversationId
      ? { ...c, lastMessage: content, lastMessageAt: reply.createdAt, unreadCount: 0 }
      : c
  );
  return reply;
}

function markAsRead(conversationId: string): void {
  const hadUnread = mockConversations.some(
    (c) => c.id === conversationId && c.unreadCount > 0
  );
  mockConversations = mockConversations.map((c) =>
    c.id === conversationId ? { ...c, unreadCount: 0 } : c
  );
  if (hadUnread) notifyUnreadChange();
}

function getTotalUnread(): number {
  return mockConversations.reduce((acc, c) => acc + c.unreadCount, 0);
}

export const chatService = {
  listConversations,
  getConversation,
  getMessages,
  sendMessage,
  simulateReply,
  markAsRead,
  getTotalUnread,
  ensureConversation,
};
