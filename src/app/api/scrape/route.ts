import { NextRequest, NextResponse } from "next/server";
import { scrapeBrawlDecks } from "../../../scripts/scrape";

export async function POST(request: NextRequest) {
  try {
    // In production, you should add authentication here
    // to prevent unauthorized access to the scraper

    // Run scraper in background
    scrapeBrawlDecks()
      .then(() => console.log("Scraper completed"))
      .catch((error) => console.error("Scraper failed:", error));

    return NextResponse.json(
      { message: "Scraping started" },
      { status: 202 }
    );
  } catch (error) {
    console.error("Scraper error:", error);
    return NextResponse.json(
      { error: "Failed to start scraping" },
      { status: 500 }
    );
  }
}
