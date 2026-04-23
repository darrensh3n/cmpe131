// ─── Types ───────────────────────────────────────────────────────────────────

export type Conversation = {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImageUrl: string;
  buyerEmail: string;
  buyerName: string;
  sellerEmail: string;
  sellerName: string;
  lastMessage: string;
  lastMessageAt: string; // ISO 8601
  unreadCount: number;   // unread for the currently logged-in user
};

export type Message = {
  id: string;
  conversationId: string;
  senderEmail: string;
  text: string;
  sentAt: string; // ISO 8601
};

// ─── Seed Data ───────────────────────────────────────────────────────────────
// These two conversations are always shown so the UI has something to display.
// TODO (backend): replace with GET /conversations?userEmail=...

const SEED_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-seed-1',
    listingId: 'listing-2',
    listingTitle: 'TI-84 Plus CE Graphing Calculator',
    listingImageUrl: 'https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=160&h=160&fit=crop',
    buyerEmail: 'YOU',          // replaced at read-time with logged-in user
    buyerName: 'You',
    sellerEmail: 'alex.kim@sjsu.edu',
    sellerName: 'Alex Kim',
    lastMessage: 'Is this still available?',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(), // 14 min ago
    unreadCount: 0,
  },
  {
    id: 'conv-seed-2',
    listingId: 'listing-4',
    listingTitle: 'Nike Dri-FIT Hoodie',
    listingImageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=160&h=160&fit=crop',
    buyerEmail: 'jordan.lee@sjsu.edu',
    buyerName: 'Jordan Lee',
    sellerEmail: 'YOU',         // replaced at read-time with logged-in user
    sellerName: 'You',
    lastMessage: 'Can you do $20?',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hrs ago
    unreadCount: 1,
  },
];

const SEED_MESSAGES: Record<string, Message[]> = {
  'conv-seed-1': [
    {
      id: 'msg-s1-1',
      conversationId: 'conv-seed-1',
      senderEmail: 'YOU',
      text: 'Hey, is the TI-84 still available?',
      sentAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    },
    {
      id: 'msg-s1-2',
      conversationId: 'conv-seed-1',
      senderEmail: 'alex.kim@sjsu.edu',
      text: 'Yeah it is! Just used it for finals.',
      sentAt: new Date(Date.now() - 1000 * 60 * 17).toISOString(),
    },
    {
      id: 'msg-s1-3',
      conversationId: 'conv-seed-1',
      senderEmail: 'YOU',
      text: 'Is this still available?',
      sentAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    },
  ],
  'conv-seed-2': [
    {
      id: 'msg-s2-1',
      conversationId: 'conv-seed-2',
      senderEmail: 'jordan.lee@sjsu.edu',
      text: 'Hi! Is the hoodie still for sale?',
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    },
    {
      id: 'msg-s2-2',
      conversationId: 'conv-seed-2',
      senderEmail: 'YOU',
      text: 'Yes! Size medium, barely worn.',
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    },
    {
      id: 'msg-s2-3',
      conversationId: 'conv-seed-2',
      senderEmail: 'jordan.lee@sjsu.edu',
      text: 'Can you do $20?',
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    },
  ],
};

// ─── In-Memory Store ──────────────────────────────────────────────────────────

let conversations: Conversation[] = [...SEED_CONVERSATIONS];
let messageStore: Record<string, Message[]> = {
  'conv-seed-1': [...SEED_MESSAGES['conv-seed-1']],
  'conv-seed-2': [...SEED_MESSAGES['conv-seed-2']],
};
let msgCounter = 100;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Resolve the "YOU" placeholder in seed data with the real logged-in user email.
 * This keeps seed data visible no matter which SJSU email the user logs in with.
 */
function resolveConversation(conv: Conversation, userEmail: string): Conversation {
  return {
    ...conv,
    buyerEmail: conv.buyerEmail === 'YOU' ? userEmail : conv.buyerEmail,
    buyerName: conv.buyerName === 'You' ? userEmail.split('@')[0] : conv.buyerName,
    sellerEmail: conv.sellerEmail === 'YOU' ? userEmail : conv.sellerEmail,
    sellerName: conv.sellerName === 'You' ? userEmail.split('@')[0] : conv.sellerName,
  };
}

function resolveMessages(msgs: Message[], userEmail: string): Message[] {
  return msgs.map((m) => ({
    ...m,
    senderEmail: m.senderEmail === 'YOU' ? userEmail : m.senderEmail,
  }));
}

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Returns all conversations for the given user, sorted most-recent first.
 * TODO (backend): GET /api/conversations — replace body with fetch call.
 */
export function getConversations(userEmail: string): Conversation[] {
  return conversations
    .map((c) => resolveConversation(c, userEmail))
    .filter((c) => c.buyerEmail === userEmail || c.sellerEmail === userEmail)
    .sort(
      (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );
}

/**
 * Returns a single conversation by ID, with "YOU" placeholders resolved.
 * TODO (backend): GET /api/conversations/:id
 */
export function getConversationById(id: string, userEmail: string): Conversation | null {
  const conv = conversations.find((c) => c.id === id);
  if (!conv) return null;
  return resolveConversation(conv, userEmail);
}

/**
 * Finds an existing conversation for the given listing + buyer, or creates one.
 * TODO (backend): POST /api/conversations — replace body with fetch call.
 */
export function getOrCreateConversation(
  listingId: string,
  buyerEmail: string,
  buyerName: string,
  sellerEmail: string,
  sellerName: string,
  listingTitle: string,
  listingImageUrl: string
): Conversation {
  const existing = conversations.find(
    (c) => c.listingId === listingId && c.buyerEmail === buyerEmail
  );
  if (existing) return existing;

  const newConvo: Conversation = {
    id: `conv-${Date.now()}`,
    listingId,
    listingTitle,
    listingImageUrl,
    buyerEmail,
    buyerName,
    sellerEmail,
    sellerName,
    lastMessage: '',
    lastMessageAt: new Date().toISOString(),
    unreadCount: 0,
  };

  conversations = [newConvo, ...conversations];
  messageStore[newConvo.id] = [];
  return newConvo;
}

/**
 * Returns all messages for a conversation, oldest first.
 * TODO (backend): GET /api/conversations/:id/messages
 */
export function getMessages(conversationId: string, userEmail: string): Message[] {
  const msgs = messageStore[conversationId] ?? [];
  return resolveMessages(msgs, userEmail).sort(
    (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
  );
}

/**
 * Appends a new message to the conversation and updates lastMessage metadata.
 * TODO (backend): POST /api/conversations/:id/messages
 */
export function sendMessage(
  conversationId: string,
  senderEmail: string,
  text: string
): Message {
  const msg: Message = {
    id: `msg-${++msgCounter}`,
    conversationId,
    senderEmail,
    text,
    sentAt: new Date().toISOString(),
  };

  messageStore[conversationId] = [...(messageStore[conversationId] ?? []), msg];

  // Update conversation metadata
  conversations = conversations.map((c) =>
    c.id === conversationId
      ? { ...c, lastMessage: text, lastMessageAt: msg.sentAt, unreadCount: 0 }
      : c
  );

  return msg;
}
