export interface MoxfieldDeck {
  id: string;
  name: string;
  description?: string;
  format: string;
  visibility: string;
  publicUrl: string;
  createdByUser: {
    userName: string;
  };
  createdAtUtc: string;
  lastUpdatedAtUtc: string;
  main: {
    count: number;
    cards: Record<string, MoxfieldCardEntry>;
  };
  commanders: {
    count: number;
    cards: Record<string, MoxfieldCardEntry>;
  };
  companions?: {
    count: number;
    cards: Record<string, MoxfieldCardEntry>;
  };
  signatureSpells?: {
    count: number;
    cards: Record<string, MoxfieldCardEntry>;
  };
}

export interface MoxfieldCardEntry {
  quantity: number;
  card: MoxfieldCard;
}

export interface MoxfieldCard {
  id: string;
  scryfall_id?: string;
  name: string;
  set?: string;
  cn?: string;
  mana_cost?: string;
  cmc?: number;
  type_line?: string;
  oracle_text?: string;
  colors?: string[];
  color_identity?: string[];
  power?: string;
  toughness?: string;
  edhrec_rank?: number;
  prices?: {
    usd?: string;
    usd_foil?: string;
    eur?: string;
  };
  image_uris?: {
    normal?: string;
    large?: string;
    art_crop?: string;
    border_crop?: string;
  };
}

export interface MoxfieldSearchResponse {
  data: {
    id: string;
    name: string;
    format: string;
    publicUrl: string;
    createdByUser: {
      userName: string;
    };
    createdAtUtc: string;
    lastUpdatedAtUtc: string;
  }[];
  totalResults: number;
  pageNumber: number;
  pageSize: number;
}

const BASE_URL = "https://api.moxfield.com/v2";
const REQUEST_DELAY = 500; // ms between requests to be respectful
const USER_AGENT = process.env.MOXFIELD_USER_AGENT || "MoxKey; BrawlREC 1.0";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function searchBrawlDecks(
  page = 1,
  pageSize = 64
): Promise<MoxfieldSearchResponse> {
  const params = new URLSearchParams({
    q: "format:brawl",
    page: page.toString(),
    pageSize: pageSize.toString(),
  });

  const response = await fetch(
    `${BASE_URL}/decks/search?${params.toString()}`,
    {
      headers: {
        Accept: "application/json",
        "User-Agent": USER_AGENT,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Moxfield API error: ${response.status} ${response.statusText}`);
  }

  await delay(REQUEST_DELAY);
  return response.json();
}

export async function getDeck(deckId: string): Promise<MoxfieldDeck> {
  const response = await fetch(`${BASE_URL}/decks/${deckId}`, {
    headers: {
      Accept: "application/json",
      "User-Agent": USER_AGENT,
    },
  });

  if (!response.ok) {
    throw new Error(`Moxfield API error: ${response.status} ${response.statusText}`);
  }

  await delay(REQUEST_DELAY);
  return response.json();
}

export function extractCardsFromDeck(deck: MoxfieldDeck): MoxfieldCardEntry[] {
  const cards: MoxfieldCardEntry[] = [];

  // Add commanders
  if (deck.commanders?.cards) {
    for (const entry of Object.values(deck.commanders.cards)) {
      cards.push({ ...entry, quantity: entry.quantity || 1 });
    }
  }

  // Add companion if present
  if (deck.companions?.cards) {
    for (const entry of Object.values(deck.companions.cards)) {
      cards.push({ ...entry, quantity: entry.quantity || 1 });
    }
  }

  // Add signature spells if present (Oathbreaker)
  if (deck.signatureSpells?.cards) {
    for (const entry of Object.values(deck.signatureSpells.cards)) {
      cards.push({ ...entry, quantity: entry.quantity || 1 });
    }
  }

  // Add main deck cards
  if (deck.main?.cards) {
    for (const entry of Object.values(deck.main.cards)) {
      cards.push({ ...entry, quantity: entry.quantity || 1 });
    }
  }

  return cards;
}

export function getCommanderFromDeck(deck: MoxfieldDeck): MoxfieldCardEntry | null {
  if (!deck.commanders?.cards) return null;
  const entries = Object.values(deck.commanders.cards);
  return entries.length > 0 ? entries[0] : null;
}
