import type { DbListing } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

export type Listing = {
  id: string;
  title: string;
  price: number;
  category: string;
  description: string;
  imageUrls: string[];
  sellerName: string;
  sellerEmail: string;
  createdAt: string;
};

function toApp(row: DbListing): Listing {
  return {
    id: row.id,
    title: row.title,
    price: Number(row.price),
    category: row.category,
    description: row.description,
    imageUrls: row.image_urls,
    sellerName: row.seller_name,
    sellerEmail: row.seller_email,
    createdAt: row.created_at,
  };
}

export async function getListings(): Promise<Listing[]> {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as DbListing[]).map(toApp);
}

export async function getListingById(id: string): Promise<Listing | null> {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return toApp(data as DbListing);
}

export async function getMyListings(email: string): Promise<Listing[]> {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('seller_email', email)
    .in('status', ['active', 'sold'])
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as DbListing[]).map(toApp);
}

export async function createListing(
  data: Omit<Listing, 'id' | 'createdAt'>
): Promise<Listing> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: row, error } = await supabase
    .from('listings')
    .insert({
      title: data.title,
      price: data.price,
      category: data.category,
      description: data.description,
      image_urls: data.imageUrls,
      seller_id: user.id,
      seller_name: data.sellerName,
      seller_email: data.sellerEmail,
    })
    .select()
    .single();

  if (error) throw error;
  return toApp(row as DbListing);
}

export const CATEGORIES = ['All', 'Textbooks', 'Electronics', 'Furniture', 'Clothing', 'Other'];
export const SELL_CATEGORIES = ['Textbooks', 'Electronics', 'Furniture', 'Clothing', 'Other'];
