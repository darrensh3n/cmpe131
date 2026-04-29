-- ============================================================
-- Spartan Marketplace — Supabase Schema
-- Paste this into the Supabase SQL Editor and click Run.
-- ============================================================

-- ── Listings ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS listings (
  id           UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  title        TEXT          NOT NULL,
  price        NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  category     TEXT          NOT NULL,
  description  TEXT          NOT NULL DEFAULT '',
  image_urls   TEXT[]        NOT NULL DEFAULT '{}',
  seller_id    UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_name  TEXT          NOT NULL DEFAULT '',
  seller_email TEXT          NOT NULL,
  status       TEXT          NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'removed')),
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active listings"
  ON listings FOR SELECT
  USING (status = 'active');

CREATE POLICY "Sellers can insert their own listings"
  ON listings FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own listings"
  ON listings FOR UPDATE
  USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete their own listings"
  ON listings FOR DELETE
  USING (auth.uid() = seller_id);

-- ── Saved Listings (Wishlist) ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS saved_listings (
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID        NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  saved_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, listing_id)
);

ALTER TABLE saved_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own saved listings"
  ON saved_listings
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Conversations ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS conversations (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id        UUID        NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  listing_title     TEXT        NOT NULL,
  listing_image_url TEXT,
  buyer_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  buyer_email       TEXT        NOT NULL,
  buyer_name        TEXT        NOT NULL DEFAULT '',
  seller_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_email      TEXT        NOT NULL,
  seller_name       TEXT        NOT NULL DEFAULT '',
  last_message      TEXT        NOT NULL DEFAULT '',
  last_message_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (listing_id, buyer_id)
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view their conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Buyers can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Participants can update conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- ── Messages ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS messages (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID        NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_email    TEXT        NOT NULL,
  text            TEXT        NOT NULL,
  sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can read messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
        AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    )
  );

CREATE POLICY "Participants can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
        AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    )
  );

-- ── Realtime ──────────────────────────────────────────────────────────────────
-- Enables live message delivery in the conversation screen.
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- ── Grants ────────────────────────────────────────────────────────────────────
-- RLS policies alone aren't enough; Postgres also requires explicit role grants.
GRANT SELECT ON public.listings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.listings TO authenticated;

GRANT SELECT, INSERT, DELETE ON public.saved_listings TO authenticated;

GRANT SELECT, INSERT, UPDATE ON public.conversations TO authenticated;

GRANT SELECT, INSERT ON public.messages TO authenticated;
