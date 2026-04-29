// Raw row shapes returned by Supabase (snake_case, price as string from PostgREST).
// Services transform these into the camelCase types consumed by the app.

export type DbListing = {
  id: string;
  title: string;
  price: string;
  category: string;
  description: string;
  image_urls: string[];
  seller_id: string;
  seller_name: string;
  seller_email: string;
  status: 'active' | 'sold' | 'removed';
  created_at: string;
};

export type DbConversation = {
  id: string;
  listing_id: string;
  listing_title: string;
  listing_image_url: string | null;
  buyer_id: string;
  buyer_email: string;
  buyer_name: string;
  seller_id: string;
  seller_email: string;
  seller_name: string;
  last_message: string;
  last_message_at: string;
  created_at: string;
};

export type DbMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_email: string;
  text: string;
  sent_at: string;
};

export type DbSavedListing = {
  user_id: string;
  listing_id: string;
  saved_at: string;
};
