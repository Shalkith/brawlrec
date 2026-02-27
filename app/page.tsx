import { SearchBar } from "../src/components/SearchBar";
import { CardCard } from "../src/components/CardCard";
import prisma from "../src/lib/db";

async function getTopCommanders() {
  const commanders = await prisma.commander.findMany({
    include: {
      card: true,
    },
    orderBy: {
      deckCount: "desc",
    },
    take: 12,
  });
  return commanders;
}

export default async function Home() {
  const commanders = await getTopCommanders();

  return (
    <div className="space-y-8">
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold mb-4">
          BrawlREC
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Deck recommendations for Magic: The Gathering Brawl format
        </p>
        <div className="max-w-xl mx-auto">
          <SearchBar />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Top Commanders</h2>

        {commanders.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {commanders.map((commander) => (
              <a
                key={commander.id}
                href={`/commanders/${commander.id}`}
                className="group"
              >
                <CardCard
                  card={commander.card}
                  stats={{ deckCount: commander.deckCount }}
                  showStats={true}
                />
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted rounded-lg">
            <p className="text-muted-foreground mb-4">
              No commander data yet. Run the scraper to populate the database.
            </p>
            <form action="/api/scrape" method="POST">
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Start Scraping
              </button>
            </form>
          </div>
        )}
      </section>
    </div>
  );
}
