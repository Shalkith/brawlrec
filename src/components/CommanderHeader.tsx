"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";

interface CommanderHeaderProps {
  commander: {
    id: string;
    deckCount: number;
    card: {
      id: string;
      name: string;
      typeLine?: string | null;
      manaCost?: string | null;
      oracleText?: string | null;
      colorIdentity?: string | null;
      imageUris?: string | null;
    };
  };
}

export function CommanderHeader({ commander }: CommanderHeaderProps) {
  const imageUris = commander.card.imageUris
    ? JSON.parse(commander.card.imageUris)
    : null;
  const imageUrl = imageUris?.art_crop || imageUris?.large || imageUris?.normal;

  const colorIdentity = commander.card.colorIdentity
    ? JSON.parse(commander.card.colorIdentity)
    : [];

  const colorMap: Record<string, string> = {
    W: "bg-yellow-100 text-yellow-900 border-yellow-300",
    U: "bg-blue-100 text-blue-900 border-blue-300",
    B: "bg-gray-800 text-gray-100 border-gray-600",
    R: "bg-red-100 text-red-900 border-red-300",
    G: "bg-green-100 text-green-900 border-green-300",
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      {imageUrl && (
        <div className="absolute inset-0 z-0">
          <Image
            src={imageUrl}
            alt=""
            fill
            className="object-cover opacity-20 blur-sm"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </div>
      )}

      <div className="relative z-10 flex gap-6 p-6">
        <div className="flex-shrink-0 w-48 h-64 relative rounded-lg overflow-hidden shadow-lg hidden sm:block">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={commander.card.name}
              fill
              className="object-cover"
              priority
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {colorIdentity.map((color: string) => (
              <Badge
                key={color}
                variant="outline"
                className={colorMap[color] || ""}
              >
                {color}
              </Badge>
            ))}
          </div>

          <h1 className="text-3xl font-bold mb-2">{commander.card.name}</h1>

          {commander.card.typeLine && (
            <p className="text-muted-foreground mb-2">{commander.card.typeLine}</p>
          )}

          {commander.card.manaCost && (
            <p className="text-lg mb-4">{commander.card.manaCost}</p>
          )}

          {commander.card.oracleText && (
            <p className="text-sm text-muted-foreground mb-4 whitespace-pre-wrap">
              {commander.card.oracleText}
            </p>
          )}

          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-base px-3 py-1">
              {commander.deckCount} decks
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
