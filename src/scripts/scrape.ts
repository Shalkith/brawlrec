import {
  searchBrawlDecks,
  getDeck,
  extractCardsFromDeck,
  getCommanderFromDeck,
  MoxfieldCard,
} from "../lib/moxfield";
import prisma from "../lib/db";

const BATCH_SIZE = 64;
const MAX_DECKS_PER_RUN = 1000; // Limit to avoid overwhelming the API

async function upsertCard(card: MoxfieldCard) {
  const imageUris = card.image_uris
    ? JSON.stringify(card.image_uris)
    : null;

  return prisma.card.upsert({
    where: {
      scryfallId: card.scryfall_id || card.id,
    },
    create: {
      scryfallId: card.scryfall_id || card.id,
      name: card.name,
      setCode: card.set || null,
      collectorNumber: card.cn || null,
      manaCost: card.mana_cost || null,
      cmc: card.cmc || null,
      typeLine: card.type_line || null,
      oracleText: card.oracle_text || null,
      colors: card.colors ? JSON.stringify(card.colors) : null,
      colorIdentity: card.color_identity
        ? JSON.stringify(card.color_identity)
        : null,
      power: card.power || null,
      toughness: card.toughness || null,
      edhrecRank: card.edhrec_rank || null,
      usd: card.prices?.usd || null,
      usdFoil: card.prices?.usd_foil || null,
      eur: card.prices?.eur || null,
      imageUris,
    },
    update: {
      name: card.name,
      setCode: card.set || null,
      collectorNumber: card.cn || null,
      manaCost: card.mana_cost || null,
      cmc: card.cmc || null,
      typeLine: card.type_line || null,
      oracleText: card.oracle_text || null,
      colors: card.colors ? JSON.stringify(card.colors) : null,
      colorIdentity: card.color_identity
        ? JSON.stringify(card.color_identity)
        : null,
      power: card.power || null,
      toughness: card.toughness || null,
      edhrecRank: card.edhrec_rank || null,
      usd: card.prices?.usd || null,
      usdFoil: card.prices?.usd_foil || null,
      eur: card.prices?.eur || null,
      imageUris,
      updatedAt: new Date(),
    },
  });
}

async function processDeck(moxfieldDeckId: string) {
  // Check if deck already exists
  const existingDeck = await prisma.deck.findUnique({
    where: { moxfieldId: moxfieldDeckId },
  });

  if (existingDeck) {
    console.log(`Skipping already processed deck: ${moxfieldDeckId}`);
    return null;
  }

  // Fetch full deck details
  const deck = await getDeck(moxfieldDeckId);

  // Get commander
  const commanderEntry = getCommanderFromDeck(deck);
  if (!commanderEntry) {
    console.log(`No commander found for deck: ${moxfieldDeckId}`);
    return null;
  }

  // Upsert commander card
  const commanderCard = await upsertCard(commanderEntry.card);

  // Get or create commander record
  const commander = await prisma.commander.upsert({
    where: { cardId: commanderCard.id },
    create: {
      cardId: commanderCard.id,
      colorIdentity: commanderCard.colorIdentity,
      updatedAt: new Date(),
    },
    update: {
      updatedAt: new Date(),
    },
  });

  // Create deck record
  const deckRecord = await prisma.deck.create({
    data: {
      moxfieldId: moxfieldDeckId,
      name: deck.name,
      commanderId: commander.id,
      colors: commanderCard.colorIdentity,
      deckFormat: "brawl",
      createdAt: new Date(deck.createdAtUtc),
      updatedAt: new Date(deck.lastUpdatedAtUtc),
    },
  });

  // Process all cards in deck
  const cards = extractCardsFromDeck(deck);
  const cardMap = new Map<string, string>(); // card scryfallId -> card.id

  for (const entry of cards) {
    const card = await upsertCard(entry.card);
    cardMap.set(entry.card.scryfall_id || entry.card.id, card.id);

    const cardId = entry.card.scryfall_id || entry.card.id;
    const dbCardId = cardMap.get(cardId);

    if (dbCardId) {
      await prisma.deckCard.create({
        data: {
          deckId: deckRecord.id,
          cardId: dbCardId,
          quantity: entry.quantity,
          isCommander: deck.commanders?.cards
            ? Object.values(deck.commanders.cards).some(
                (c) => c.card.scryfall_id === entry.card.scryfall_id
              )
            : false,
          isCompanion: deck.companions?.cards
            ? Object.values(deck.companions.cards).some(
                (c) => c.card.scryfall_id === entry.card.scryfall_id
              )
            : false,
        },
      });
    }
  }

  console.log(`Processed deck: ${deck.name} (${moxfieldDeckId})`);
  return deckRecord;
}

async function updateCardStats() {
  console.log("Updating card statistics...");

  // Get all commanders
  const commanders = await prisma.commander.findMany({
    include: {
      card: true,
    },
  });

  for (const commander of commanders) {
    // Count total decks for this commander
    const totalDecks = await prisma.deck.count({
      where: { commanderId: commander.id },
    });

    if (totalDecks === 0) continue;

    // Update deck count
    await prisma.commander.update({
      where: { id: commander.id },
      data: { deckCount: totalDecks },
    });

    // Get card usage for this commander
    const cardUsage = await prisma.deckCard.groupBy({
      by: ["cardId"],
      where: {
        deck: {
          commanderId: commander.id,
        },
        isCommander: false, // Exclude commander itself
      },
      _count: {
        cardId: true,
      },
    });

    // Calculate total decks across all commanders for synergy calculation
    const totalDecksInFormat = await prisma.deck.count();

    for (const usage of cardUsage) {
      const deckCount = usage._count.cardId;
      const inclusionRate = (deckCount / totalDecks) * 100;

      // Calculate synergy score
      // How much more likely is this card in this commander vs other commanders?
      const usageInOtherDecks = await prisma.deckCard.count({
        where: {
          cardId: usage.cardId,
          deck: {
            commanderId: {
              not: commander.id,
            },
          },
        },
      });

      const otherDecksCount = totalDecksInFormat - totalDecks;
      const baselineRate =
        otherDecksCount > 0 ? (usageInOtherDecks / otherDecksCount) * 100 : 0;

      // Synergy score: positive means more likely in this commander
      const synergyScore = inclusionRate - baselineRate;

      await prisma.cardStat.upsert({
        where: {
          commanderId_cardId: {
            commanderId: commander.id,
            cardId: usage.cardId,
          },
        },
        create: {
          commanderId: commander.id,
          cardId: usage.cardId,
          deckCount,
          inclusionRate,
          synergyScore,
        },
        update: {
          deckCount,
          inclusionRate,
          synergyScore,
          updatedAt: new Date(),
        },
      });
    }
  }

  console.log("Card statistics updated.");
}

async function scrapeBrawlDecks() {
  console.log("Starting Brawl deck scraping...");
  let page = 1;
  let processedCount = 0;
  let hasMore = true;

  while (hasMore && processedCount < MAX_DECKS_PER_RUN) {
    console.log(`Fetching page ${page}...`);

    try {
      const searchResult = await searchBrawlDecks(page, BATCH_SIZE);

      if (searchResult.data.length === 0) {
        hasMore = false;
        break;
      }

      for (const deckSummary of searchResult.data) {
        if (processedCount >= MAX_DECKS_PER_RUN) break;

        try {
          await processDeck(deckSummary.id);
          processedCount++;
        } catch (error) {
          console.error(`Error processing deck ${deckSummary.id}:`, error);
        }
      }

      page++;

      // Stop if we've reached the end
      if (searchResult.data.length < BATCH_SIZE) {
        hasMore = false;
      }
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error);
      hasMore = false;
    }
  }

  console.log(`Processed ${processedCount} decks.`);

  // Update statistics
  await updateCardStats();

  console.log("Scraping complete.");
}

// Run if executed directly
if (require.main === module) {
  scrapeBrawlDecks()
    .catch(console.error)
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { scrapeBrawlDecks, processDeck, updateCardStats };
