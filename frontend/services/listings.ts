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
      'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=800&h=600&fit=crop',
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
      'https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=600&fit=crop',
    ],
    sellerName: 'Jordan Lee',
    sellerEmail: 'jordan.lee@sjsu.edu',
    createdAt: '2026-03-17T14:30:00Z',
  },
  {
    id: '3',
    title: 'IKEA Study Desk',
    price: 35,
    category: 'Furniture',
    description: 'Simple white IKEA desk, perfect for dorm rooms. Easy to assemble, fits in tight spaces.',
    imageUrls: [
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=800&h=600&fit=crop',
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
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&h=600&fit=crop',
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
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&h=600&fit=crop',
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
      'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1536353284924-9220c464e262?w=800&h=600&fit=crop',
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
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=600&fit=crop',
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
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop',
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
