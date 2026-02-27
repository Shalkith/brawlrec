import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    if (!q || q.length < 2) {
      return NextResponse.json(
        { error: "Query must be at least 2 characters" },
        { status: 400 }
      );
    }

    // SQLite doesn't support mode: "insensitive", so we use a case-insensitive workaround
    const cards = await prisma.card.findMany({
      where: {
        name: {
          contains: q,
        },
      },
      take: 20,
      orderBy: {
        edhrecRank: "asc",
      },
    });

    // Filter case-insensitively in memory
    const filteredCards = cards.filter(card =>
      card.name.toLowerCase().includes(q.toLowerCase())
    );

    return NextResponse.json({ cards: filteredCards });
  } catch (error) {
    console.error("Error searching cards:", error);
    return NextResponse.json(
      { error: "Failed to search cards" },
      { status: 500 }
    );
  }
}
