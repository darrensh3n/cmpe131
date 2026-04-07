// ─────────────────────────────────────────────────────────────────────────────
// Listings Service
//
// Backend devs: replace the mock implementations of `getListings`,
// `getListingById`, `getMyListings`, and `createListing` with real fetch()
// calls to your API. The Listing type and function signatures should stay the
// same — the rest of the app won't need to change.
// ─────────────────────────────────────────────────────────────────────────────

export type Listing = {
  id: string;
  title: string;
  price: number;         // in USD
  category: string;
  description: string;
  imageUrls: string[];   // first image is the primary; up to 5 allowed
  sellerName: string;
  sellerEmail: string;   // must be @sjsu.edu
  createdAt: string;     // ISO 8601
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

let MOCK_LISTINGS: Listing[] = [
  {
    id: '1',
    title: 'Calculus: Early Transcendentals 8th Ed',
    price: 45,
    category: 'Textbooks',
    description: 'Good condition, minor highlighting in chapters 1-3. Perfect for MATH 31 or 32.',
    imageUrls: [
      'https://placehold.co/400x300/EEF2F8/5A6A85?text=Calculus+Textbook',
      'https://placehold.co/400x300/D6E4F0/0055A2?text=Inside+Pages',
      'https://placehold.co/400x300/FFF8E7/C48A0A?text=Highlighting',
    ],
    sellerName: 'Alex Kim',
    sellerEmail: 'alex.kim@sjsu.edu',
    createdAt: '2026-03-18T10:00:00Z',
  },
  {
    id: '2',
    title: 'TI-84 Plus CE Graphing Calculator',
    price: 80,
    category: 'Electronics',
    description: 'Works perfectly, includes USB cable and case. Used for two semesters.',
    imageUrls: [
      'https://placehold.co/400x300/EEF2F8/5A6A85?text=TI-84+Calculator',
      'https://placehold.co/400x300/D6E4F0/0055A2?text=With+Case',
    ],
    sellerName: 'Jordan Lee',
    sellerEmail: 'jordan.lee@sjsu.edu',
    createdAt: '2026-03-17T14:30:00Z',
  },
  {
    id: '3',
    title: 'IKEA Desk Lamp',
    price: 12,
    category: 'Furniture',
    description: 'White adjustable desk lamp, great for dorm rooms. Bulb included.',
    imageUrls: [
      'https://placehold.co/400x300/EEF2F8/5A6A85?text=Desk+Lamp',
      'https://placehold.co/400x300/D6E4F0/0055A2?text=Lamp+On',
      'https://placehold.co/400x300/FFF8E7/C48A0A?text=Side+View',
    ],
    sellerName: 'Priya Sharma',
    sellerEmail: 'priya.sharma@sjsu.edu',
    createdAt: '2026-03-17T09:15:00Z',
  },
  {
    id: '4',
    title: 'Nike Dri-FIT Hoodie (M)',
    price: 25,
    category: 'Clothing',
    description: 'Medium, light gray. Worn a handful of times, no stains or tears.',
    imageUrls: [
      'https://placehold.co/400x300/EEF2F8/5A6A85?text=Nike+Hoodie',
      'https://placehold.co/400x300/D6E4F0/0055A2?text=Back+View',
    ],
    sellerName: 'Marcus Davis',
    sellerEmail: 'marcus.davis@sjsu.edu',
    createdAt: '2026-03-16T18:00:00Z',
  },
  {
    id: '5',
    title: 'Computer Organization & Design (RISC-V)',
    price: 55,
    category: 'Textbooks',
    description: 'Required for CS 147. Barely used, no writing inside.',
    imageUrls: [
      'https://placehold.co/400x300/EEF2F8/5A6A85?text=CS+Textbook',
      'https://placehold.co/400x300/D6E4F0/0055A2?text=Back+Cover',
    ],
    sellerName: 'Sarah Chen',
    sellerEmail: 'sarah.chen@sjsu.edu',
    createdAt: '2026-03-15T11:00:00Z',
  },
  {
    id: '6',
    title: 'Mini Fridge (Compact, 1.7 cu ft)',
    price: 60,
    category: 'Furniture',
    description: 'Works great, fits perfectly under a dorm desk. Must pick up from Campus Village.',
    imageUrls: [
      'https://placehold.co/400x300/EEF2F8/5A6A85?text=Mini+Fridge',
      'https://placehold.co/400x300/D6E4F0/0055A2?text=Inside+View',
      'https://placehold.co/400x300/FFF8E7/C48A0A?text=Side+View',
    ],
    sellerName: 'Tyler Nguyen',
    sellerEmail: 'tyler.nguyen@sjsu.edu',
    createdAt: '2026-03-14T16:45:00Z',
  },
  {
    id: '7',
    title: 'Apple Magic Mouse (Space Gray)',
    price: 40,
    category: 'Electronics',
    description: 'Like new, bought last semester. Includes original box.',
    imageUrls: [
      'https://placehold.co/400x300/EEF2F8/5A6A85?text=Magic+Mouse',
      'https://placehold.co/400x300/D6E4F0/0055A2?text=Original+Box',
    ],
    sellerName: 'Mia Torres',
    sellerEmail: 'mia.torres@sjsu.edu',
    createdAt: '2026-03-13T08:30:00Z',
  },
  {
    id: '8',
    title: 'Introduction to Algorithms (CLRS)',
    price: 50,
    category: 'Textbooks',
    description: '3rd edition, used for CS 146. A few sticky notes but great condition overall.',
    imageUrls: [
      'https://placehold.co/400x300/EEF2F8/5A6A85?text=Algorithms+Book',
      'https://placehold.co/400x300/D6E4F0/0055A2?text=Sticky+Notes',
      'https://placehold.co/400x300/FFF8E7/C48A0A?text=Back+Cover',
    ],
    sellerName: 'David Park',
    sellerEmail: 'david.park@sjsu.edu',
    createdAt: '2026-03-12T13:00:00Z',
  },
];

// ─── Service Functions ────────────────────────────────────────────────────────

export async function getListings(): Promise<Listing[]> {
  // TODO (backend): replace with real API call
  return Promise.resolve([...MOCK_LISTINGS]);
}

export async function getListingById(id: string): Promise<Listing | null> {
  // TODO (backend): replace with real API call
  const listing = MOCK_LISTINGS.find((l) => l.id === id) ?? null;
  return Promise.resolve(listing);
}

export async function getMyListings(email: string): Promise<Listing[]> {
  // TODO (backend): replace with real API call
  return Promise.resolve(MOCK_LISTINGS.filter((l) => l.sellerEmail === email));
}

export function createListing(
  data: Omit<Listing, 'id' | 'createdAt'>
): Listing {
  // TODO (backend): replace with real API call
  const newListing: Listing = {
    ...data,
    id: String(Date.now()),
    createdAt: new Date().toISOString(),
  };
  MOCK_LISTINGS = [newListing, ...MOCK_LISTINGS];
  return newListing;
}

export const CATEGORIES = ['All', 'Textbooks', 'Electronics', 'Furniture', 'Clothing', 'Other'];
export const SELL_CATEGORIES = ['Textbooks', 'Electronics', 'Furniture', 'Clothing', 'Other'];
