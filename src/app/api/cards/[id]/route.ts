import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const card = await prisma.card.findUnique({
      where: { id },
    });

    if (!card) {
      return NextResponse.json(
        { error: "Card not found" },
        { status: 404 }
      );
    }

    // Get commanders that use this card
    const cardStats = await prisma.cardStat.findMany({
      where: { cardId: id },
      include: {
        commander: {
          include: {
            card: true,
          },
        },
      },
      orderBy: {
        deckCount: "desc",
      },
      take: 20,
    });

    return NextResponse.json({
      card,
      usage: cardStats,
    });
  } catch (error) {
    console.error("Error fetching card:", error);
    return NextResponse.json(
      { error: "Failed to fetch card" },
      { status: 500 }
    );
  }
}
