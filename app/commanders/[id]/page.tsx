import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommanderHeader } from "../../../src/components/CommanderHeader";
import { CardGrid } from "../../../src/components/CardGrid";

async function getCommanderRecommendations(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/commanders/${id}/recommendations`, {
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error("Failed to fetch recommendations");
  }

  return response.json();
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CommanderPage({ params }: PageProps) {
  const { id } = await params;
  const data = await getCommanderRecommendations(id);

  if (!data) {
    notFound();
  }

  const { commander, staples, highSynergy, creatures, instants, sorceries, artifacts, enchantments, lands, budgetCards } = data;

  return (
    <div className="space-y-8">
      <CommanderHeader commander={commander} />

      <Tabs defaultValue="staples" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-2">
          <TabsTrigger value="staples">Staples</TabsTrigger>
          <TabsTrigger value="synergy">High Synergy</TabsTrigger>
          <TabsTrigger value="creatures">Creatures</TabsTrigger>
          <TabsTrigger value="instants">Instants</TabsTrigger>
          <TabsTrigger value="sorceries">Sorceries</TabsTrigger>
          <TabsTrigger value="artifacts">Artifacts</TabsTrigger>
          <TabsTrigger value="enchantments">Enchantments</TabsTrigger>
          <TabsTrigger value="lands">Lands</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
        </TabsList>

        <TabsContent value="staples" className="mt-6">
          <h2 className="text-xl font-semibold mb-4">
            Staple Cards ({staples?.length || 0})
          </h2>
          <CardGrid cards={staples || []} />
        </TabsContent>

        <TabsContent value="synergy" className="mt-6">
          <h2 className="text-xl font-semibold mb-4">
            High Synergy Cards ({highSynergy?.length || 0})
          </h2>
          <p className="text-muted-foreground mb-4">
            Cards that appear significantly more often in this commander than average
          </p>
          <CardGrid cards={highSynergy || []} />
        </TabsContent>

        <TabsContent value="creatures" className="mt-6">
          <h2 className="text-xl font-semibold mb-4">
            Creatures ({creatures?.length || 0})
          </h2>
          <CardGrid cards={creatures || []} />
        </TabsContent>

        <TabsContent value="instants" className="mt-6">
          <h2 className="text-xl font-semibold mb-4">
            Instants ({instants?.length || 0})
          </h2>
          <CardGrid cards={instants || []} />
        </TabsContent>

        <TabsContent value="sorceries" className="mt-6">
          <h2 className="text-xl font-semibold mb-4">
            Sorceries ({sorceries?.length || 0})
          </h2>
          <CardGrid cards={sorceries || []} />
        </TabsContent>

        <TabsContent value="artifacts" className="mt-6">
          <h2 className="text-xl font-semibold mb-4">
            Artifacts ({artifacts?.length || 0})
          </h2>
          <CardGrid cards={artifacts || []} />
        </TabsContent>

        <TabsContent value="enchantments" className="mt-6">
          <h2 className="text-xl font-semibold mb-4">
            Enchantments ({enchantments?.length || 0})
          </h2>
          <CardGrid cards={enchantments || []} />
        </TabsContent>

        <TabsContent value="lands" className="mt-6">
          <h2 className="text-xl font-semibold mb-4">
            Lands ({lands?.length || 0})
          </h2>
          <CardGrid cards={lands || []} />
        </TabsContent>

        <TabsContent value="budget" className="mt-6">
          <h2 className="text-xl font-semibold mb-4">
            Budget Cards (&lt;$1) ({budgetCards?.length || 0})
          </h2>
          <CardGrid cards={budgetCards || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
