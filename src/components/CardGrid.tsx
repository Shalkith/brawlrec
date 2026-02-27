"use client";

import { CardCard } from "./CardCard";

interface CardGridProps {
  cards: Array<{
    card: {
      id: string;
      name: string;
      typeLine?: string | null;
      manaCost?: string | null;
      imageUris?: string | null;
      usd?: string | null;
    };
    inclusionRate?: number | null;
    synergyScore?: number | null;
    deckCount?: number;
  }>;
}

export function CardGrid({ cards }: CardGridProps) {
  if (cards.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No cards found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {cards.map(({ card, inclusionRate, synergyScore, deckCount }) => (
        <CardCard
          key={card.id}
          card={card}
          stats={{ inclusionRate, synergyScore, deckCount }}
        />
      ))}
    </div>
  );
}
