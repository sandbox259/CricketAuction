import { getUserWithRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import ViewerDashboard from "@/components/viewer/viewer-dashboard"

export default async function ViewerPage() {
  const user = await getUserWithRole().catch(() => null)

  const supabase = createClient()

  // Fetch initial data for viewer dashboard
  const [
    { data: teams },
    { data: players },
    { data: assignments },
    { data: auctionOverview },
    { data: auctionState },
  ] = await Promise.all([
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

    supabase
      .from("auction_state")
      .select("current_player_id")
      .eq("id", 1)
      .maybeSingle(),
  ])

  let currentPlayer = null

  if (auctionState?.current_player_id) {
    const { data: player } = await supabase
      .from("players")
      .select("id, name, image, position, achievement, base_price")
      .eq("id", auctionState.current_player_id)
      .maybeSingle()

    currentPlayer = player
  }

  return (
    <ViewerDashboard
      user={user}
      initialData={{
        teams: teams || [],
        players: players || [],
        assignments: assignments || [],
        auctionOverview: auctionOverview || {},
        currentPlayer,
      }}
    />
  )
}