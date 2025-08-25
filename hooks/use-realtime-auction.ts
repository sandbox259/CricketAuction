"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

interface AuctionData {
  teams: any[]
  players: any[]
  assignments: any[]
  auctionOverview: any
}

export function useRealtimeAuction(initialData: AuctionData) {
  const [data, setData] = useState<AuctionData>(initialData)
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    let channels: RealtimeChannel[] = []

    const setupRealtimeSubscriptions = async () => {
      try {
        // Subscribe to players table changes
        const playersChannel = supabase
          .channel("players-changes")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "players",
            },
            async (payload) => {
              console.log("Players change:", payload)

              // Refetch players data
              const { data: players } = await supabase.from("players").select("*").order("name")

              if (players) {
                setData((prev) => ({ ...prev, players }))
                setLastUpdate(new Date())
              }
            },
          )
          .subscribe((status) => {
            console.log("Players subscription status:", status)
            setIsConnected(status === "SUBSCRIBED")
          })

        // Subscribe to assignments table changes
        const assignmentsChannel = supabase
          .channel("assignments-changes")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "assignments",
            },
            async (payload) => {
              console.log("Assignments change:", payload)

              // Refetch assignments with related data
              const { data: assignments } = await supabase
                .from("assignments")
                .select(`
                  *,
                  player:players(*),
                  team:teams(*)
                `)
                .order("assigned_at", { ascending: false })

              if (assignments) {
                setData((prev) => ({ ...prev, assignments }))
                setLastUpdate(new Date())
              }
            },
          )
          .subscribe()

        // Subscribe to teams table changes
        const teamsChannel = supabase
          .channel("teams-changes")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "teams",
            },
            async (payload) => {
              console.log("Teams change:", payload)

              // Refetch teams data
              const { data: teams } = await supabase.from("teams").select("*").order("name")

              if (teams) {
                setData((prev) => ({ ...prev, teams }))
                setLastUpdate(new Date())
              }
            },
          )
          .subscribe()

        // Subscribe to auction overview updates
        const overviewChannel = supabase
          .channel("auction-overview")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "assignments",
            },
            async () => {
              // Refetch auction overview when assignments change
              const { data: auctionOverview } = await supabase.rpc("get_auction_overview")

              if (auctionOverview) {
                setData((prev) => ({ ...prev, auctionOverview }))
                setLastUpdate(new Date())
              }
            },
          )
          .subscribe()

        channels = [playersChannel, assignmentsChannel, teamsChannel, overviewChannel]

        // Set connection status
        setIsConnected(true)
      } catch (error) {
        console.error("Error setting up realtime subscriptions:", error)
        setIsConnected(false)
      }
    }

    setupRealtimeSubscriptions()

    // Cleanup function
    return () => {
      channels.forEach((channel) => {
        supabase.removeChannel(channel)
      })
      setIsConnected(false)
    }
  }, [])

  return {
    data,
    isConnected,
    lastUpdate,
  }
}
