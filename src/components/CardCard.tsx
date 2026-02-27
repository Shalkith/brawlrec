"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CardCardProps {
  card: {
    id: string;
    name: string;
    typeLine?: string | null;
    manaCost?: string | null;
    imageUris?: string | null;
    usd?: string | null;
  };
  stats?: {
    inclusionRate?: number | null;
    synergyScore?: number | null;
    deckCount?: number;
  };
  showStats?: boolean;
}

export function CardCard({ card, stats, showStats = true }: CardCardProps) {
  const imageUris = card.imageUris
    ? JSON.parse(card.imageUris)
    : null;
  const imageUrl = imageUris?.normal || imageUris?.large || "/card-back.jpg";

  return (
    <Link href={`/cards/${card.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-0">
          <div className="aspect-[63/88] relative bg-gray-100">
            <Image
              src={imageUrl}
              alt={card.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
            />
          </div>
          <div className="p-3">
            <h3 className="font-medium text-sm truncate">{card.name}</h3>
            {card.manaCost && (
              <p className="text-xs text-muted-foreground">{card.manaCost}</p>
            )}

            {showStats && stats && (
              <div className="mt-2 flex flex-wrap gap-1">
                {stats.inclusionRate && (
                  <Badge variant="secondary" className="text-xs">
                    {(stats.inclusionRate).toFixed(0)}% decks
                  </Badge>
                )}
                {stats.synergyScore && stats.synergyScore > 10 && (
                  <Badge variant="default" className="text-xs">
                    +{(stats.synergyScore).toFixed(0)}% synergy
                  </Badge>
                )}
                {card.usd && (
                  <Badge variant="outline" className="text-xs">
                    ${card.usd}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
