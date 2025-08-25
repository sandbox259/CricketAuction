import { getUserWithRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import ViewerDashboard from "@/components/viewer/viewer-dashboard"

export default async function ViewerPage() {
  const user = await getUserWithRole().catch(() => null)

  const supabase = createClient()

  // Fetch initial data for viewer dashboard
  const [{ data: teams }, { data: players }, { data: assignments }, { data: auctionOverview }] = await Promise.all([
    supabase.from("teams").select("*").order("name"),
    supabase.from("players").select("*").order("name"),
    supabase
      .from("assignments")
      .select(`
      *,
      player:players(*),
      team:teams(*)
    `)
      .order("assigned_at", { ascending: false }),
    supabase.rpc("get_auction_overview"),
  ])

  return (
    <ViewerDashboard
      user={user}
      initialData={{
        teams: teams || [],
        players: players || [],
        assignments: assignments || [],
        auctionOverview: auctionOverview || {},
      }}
    />
  )
}
