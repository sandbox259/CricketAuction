import { requireAdmin } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import AdminDashboard from "@/components/admin/admin-dashboard"

export default async function AdminPage() {
  const user = await requireAdmin()
  const supabase = createClient()

  // Fetch initial data for dashboard
  const [{ data: teams }, { data: players }, { data: assignments }, { data: users }, { data: auctionOverview }] =
    await Promise.all([
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
      supabase.from("users").select("*").order("created_at"),
      supabase.rpc("get_auction_overview"),
    ])

  return (
    <AdminDashboard
      user={user}
      initialData={{
        teams: teams || [],
        players: players || [],
        assignments: assignments || [],
        users: users || [],
        auctionOverview: auctionOverview || {},
      }}
    />
  )
}
