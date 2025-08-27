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
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)

  useEffect(() => {
    let channels: RealtimeChannel[] = []

    const updateTimestamp = () => {
      setLastUpdate(
        new Date().toLocaleTimeString("en-US", {
          hour12: true,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      )
    }

    const setupRealtimeSubscriptions = async () => {
      try {
        // Players
        const playersChannel = supabase
          .channel("players-changes")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "players" },
            async () => {
              const { data: players } = await supabase.from("players").select("*").order("name")
              if (players) {
                setData((prev) => ({ ...prev, players }))
                updateTimestamp()
              }
            }
          )
          .subscribe()

        // Assignments
        const assignmentsChannel = supabase
          .channel("assignments-changes")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "assignments" },
            async () => {
              const { data: assignments } = await supabase
                .from("assignments")
                .select(`*, player:players(*), team:teams(*)`)
                .order("assigned_at", { ascending: false })

              if (assignments) {
                setData((prev) => ({ ...prev, assignments }))
                updateTimestamp()
              }
            }
          )
          .subscribe()

        // Teams
        const teamsChannel = supabase
          .channel("teams-changes")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "teams" },
            async () => {
              const { data: teams } = await supabase.from("teams").select("*").order("name")
              if (teams) {
                setData((prev) => ({ ...prev, teams }))
                updateTimestamp()
              }
            }
          )
          .subscribe()

        // Auction Overview
        const overviewChannel = supabase
          .channel("auction-overview")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "assignments" },
            async () => {
              const { data: auctionOverview } = await supabase.rpc("get_auction_overview")
              if (auctionOverview) {
                setData((prev) => ({ ...prev, auctionOverview }))
                updateTimestamp()
              }
            }
          )
          .subscribe()

        channels = [playersChannel, assignmentsChannel, teamsChannel, overviewChannel]
        setIsConnected(true)
      } catch (error) {
        console.error("Error setting up realtime subscriptions:", error)
        setIsConnected(false)
      }
    }

    setupRealtimeSubscriptions()

    return () => {
      channels.forEach((channel) => supabase.removeChannel(channel))
      setIsConnected(false)
    }
  }, [])

  return {
    data,
    isConnected,
    lastUpdate,
  }
}
