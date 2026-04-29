import type { DbConversation, DbMessage } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

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
  lastMessageAt: string;
  unreadCount: number;
};

export type Message = {
  id: string;
  conversationId: string;
  senderEmail: string;
  text: string;
  sentAt: string;
};

function toConversation(row: DbConversation): Conversation {
  return {
    id: row.id,
    listingId: row.listing_id,
    listingTitle: row.listing_title,
    listingImageUrl: row.listing_image_url ?? '',
    buyerEmail: row.buyer_email,
    buyerName: row.buyer_name,
    sellerEmail: row.seller_email,
    sellerName: row.seller_name,
    lastMessage: row.last_message,
    lastMessageAt: row.last_message_at,
    unreadCount: 0,
  };
}

function toMessage(row: DbMessage): Message {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderEmail: row.sender_email,
    text: row.text,
    sentAt: row.sent_at,
  };
}

export async function getConversations(userEmail: string): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .or(`buyer_email.eq.${userEmail},seller_email.eq.${userEmail}`)
    .order('last_message_at', { ascending: false });

  if (error) throw error;
  return (data as DbConversation[]).map(toConversation);
}

export async function getConversationById(id: string, _userEmail: string): Promise<Conversation | null> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return toConversation(data as DbConversation);
}

export async function getOrCreateConversation(
  listingId: string,
  buyerEmail: string,
  buyerName: string,
  sellerEmail: string,
  sellerName: string,
  listingTitle: string,
  listingImageUrl: string
): Promise<Conversation> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Return existing conversation if one already exists for this listing + buyer
  const { data: existing } = await supabase
    .from('conversations')
    .select('*')
    .eq('listing_id', listingId)
    .eq('buyer_id', user.id)
    .maybeSingle();

  if (existing) return toConversation(existing as DbConversation);

  // Look up seller_id from the listing row
  const { data: listingRow } = await supabase
    .from('listings')
    .select('seller_id')
    .eq('id', listingId)
    .single();

  const { data: row, error } = await supabase
    .from('conversations')
    .insert({
      listing_id: listingId,
      listing_title: listingTitle,
      listing_image_url: listingImageUrl,
      buyer_id: user.id,
      buyer_email: buyerEmail,
      buyer_name: buyerName,
      seller_id: listingRow?.seller_id ?? user.id,
      seller_email: sellerEmail,
      seller_name: sellerName,
    })
    .select()
    .single();

  if (error) throw error;
  return toConversation(row as DbConversation);
}

export async function getMessages(conversationId: string, _userEmail: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('sent_at', { ascending: true });

  if (error) throw error;
  return (data as DbMessage[]).map(toMessage);
}

export async function sendMessage(
  conversationId: string,
  senderEmail: string,
  text: string
): Promise<Message> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: row, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      sender_email: senderEmail,
      text,
    })
    .select()
    .single();

  if (error) throw error;

  await supabase
    .from('conversations')
    .update({ last_message: text, last_message_at: new Date().toISOString() })
    .eq('id', conversationId);

  return toMessage(row as DbMessage);
}
