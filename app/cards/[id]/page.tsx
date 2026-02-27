import { notFound } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { CardCard } from "../../../src/components/CardCard";

async function getCardData(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/cards/${id}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error("Failed to fetch card");
  }

  return response.json();
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CardPage({ params }: PageProps) {
  const { id } = await params;
  const data = await getCardData(id);

  if (!data) {
    notFound();
  }

  const { card, usage } = data;
  const imageUris = card.imageUris ? JSON.parse(card.imageUris) : null;
  const imageUrl = imageUris?.normal || imageUris?.large;
  const colorIdentity = card.colorIdentity ? JSON.parse(card.colorIdentity) : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-80 flex-shrink-0">
          {imageUrl ? (
            <div className="aspect-[63/88] relative rounded-lg overflow-hidden shadow-lg">
              <Image
                src={imageUrl}
                alt={card.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <div className="aspect-[63/88] bg-muted rounded-lg flex items-center justify-center">
              No Image
            </div>
          )}

          <div className="mt-4 space-y-2">
            {card.usd && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price:</span>
                <span>${card.usd}</span>
              </div>
            )}
            {card.usdFoil && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Foil:</span>
                <span>${card.usdFoil}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap gap-2 mb-4">
            {colorIdentity.map((color: string) => (
              <Badge key={color} variant="outline">{color}</Badge>
            ))}
          </div>

          <h1 className="text-3xl font-bold mb-2">{card.name}</h1>

          {card.manaCost && (
            <p className="text-lg text-muted-foreground mb-2">{card.manaCost}</p>
          )}

          {card.typeLine && (
            <p className="text-muted-foreground mb-4">{card.typeLine}</p>
          )}

          {card.oracleText && (
            <div className="bg-muted p-4 rounded-lg mb-6">
              <p className="whitespace-pre-wrap">{card.oracleText}</p>
            </div>
          )}

          {(card.power || card.toughness) && (
            <p className="mb-4">
              <span className="font-medium">Power/Toughness:</span> {card.power}/{card.toughness}
            </p>
          )}
        </div>
      </div>

      <section>
        <h2 className="text-2xl font-semibold mb-6">
          Popular in Commanders ({usage?.length || 0})
        </h2>

        {usage && usage.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {usage.map((stat: any) => (
              <a
                key={stat.commander.id}
                href={`/commanders/${stat.commander.id}`}
                className="group"
              >
                <CardCard
                  card={stat.commander.card}
                  stats={{
                    inclusionRate: stat.inclusionRate,
                    deckCount: stat.deckCount,
                  }}
                  showStats={true}
                />
              </a>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            No commander data available for this card yet.
          </p>
        )}
      </section>
    </div>
  );
}
