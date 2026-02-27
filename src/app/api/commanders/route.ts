import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const commanders = await prisma.commander.findMany({
      include: {
        card: true,
      },
      orderBy: {
        deckCount: "desc",
      },
      skip,
      take: limit,
    });

    const total = await prisma.commander.count();

    return NextResponse.json({
      commanders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching commanders:", error);
    return NextResponse.json(
      { error: "Failed to fetch commanders" },
      { status: 500 }
    );
  }
}
