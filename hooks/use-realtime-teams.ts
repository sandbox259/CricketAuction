"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"

export function useRealtimeTeams(initialTeams: any[]) {
  const [teams, setTeams] = useState(initialTeams)
  const [teamSummaries, setTeamSummaries] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchTeamSummaries = async (teamsData: any[]) => {
    setLoading(true)
    try {
      const summaries = await Promise.all(
        teamsData.map(async (team) => {
          const { data } = await supabase.rpc("get_team_summary", {
            p_team_id: team.id,
          })
          return data
        }),
      )
      setTeamSummaries(summaries.filter(Boolean))
    } catch (error) {
      console.error("Error fetching team summaries:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeamSummaries(teams)
  }, [teams])

  useEffect(() => {
    const channel = supabase
      .channel("teams-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "teams",
        },
        async () => {
          const { data: updatedTeams } = await supabase.from("teams").select("*").order("name")

          if (updatedTeams) {
            setTeams(updatedTeams)
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "assignments",
        },
        () => {
          // Refetch team summaries when assignments change
          fetchTeamSummaries(teams)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [teams])

  return {
    teams,
    teamSummaries,
    loading,
  }
}
