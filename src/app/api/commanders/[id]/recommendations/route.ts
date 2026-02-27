import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const commander = await prisma.commander.findUnique({
      where: { id },
      include: {
        card: true,
      },
    });

    if (!commander) {
      return NextResponse.json(
        { error: "Commander not found" },
        { status: 404 }
      );
    }

    // Build where clause
    const where: any = {
      commanderId: id,
    };

    if (type) {
      where.card = {
        typeLine: {
          contains: type,
        },
      };
    }

    // Get card stats for this commander
    const cardStats = await prisma.cardStat.findMany({
      where,
      include: {
        card: true,
      },
      orderBy: [
        { inclusionRate: "desc" },
      ],
      take: 100,
    });

    // Categorize cards
    const categories = {
      staples: cardStats
        .filter((stat) => (stat.inclusionRate || 0) >= 50)
        .slice(0, 20),
      highSynergy: cardStats
        .filter((stat) => (stat.synergyScore || 0) > 20)
        .sort((a, b) => (b.synergyScore || 0) - (a.synergyScore || 0))
        .slice(0, 20),
      creatures: cardStats
        .filter((stat) =>
          stat.card.typeLine?.toLowerCase().includes("creature")
        )
        .slice(0, 20),
      instants: cardStats
        .filter((stat) =>
          stat.card.typeLine?.toLowerCase().includes("instant")
        )
        .slice(0, 20),
      sorceries: cardStats
        .filter((stat) =>
          stat.card.typeLine?.toLowerCase().includes("sorcery")
        )
        .slice(0, 20),
      artifacts: cardStats
        .filter((stat) =>
          stat.card.typeLine?.toLowerCase().includes("artifact")
        )
        .slice(0, 20),
      enchantments: cardStats
        .filter((stat) =>
          stat.card.typeLine?.toLowerCase().includes("enchantment")
        )
        .slice(0, 20),
      lands: cardStats
        .filter((stat) =>
          stat.card.typeLine?.toLowerCase().includes("land")
        )
        .slice(0, 20),
      budgetCards: cardStats
        .filter((stat) => {
          const price = parseFloat(stat.card.usd || "0");
          return price > 0 && price < 1;
        })
        .slice(0, 20),
    };

    return NextResponse.json({
      commander,
      ...categories,
      totalCards: cardStats.length,
    });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}
