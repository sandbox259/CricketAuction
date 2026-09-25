"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

interface AuctionData {
  teams: any[]
  players: any[]
  assignments: any[]
  auctionOverview: any
  currentPlayer?: {
    id: number
    name: string
    image?: string
    position?: string
    achievement?: string
    base_price?: number
    previous_team?: string
    city?: string
  } | null
}

type PlayerRow = {
  id: number
  name: string
  status?: string
  image?: string
  position?: string
  achievement?: string
  base_price?: number
  previous_team?: string
  city?: string
  [key: string]: any
}

type TeamRow = {
  id: number
  name: string
  budget?: number
  team_logo?: string
  is_pune?: boolean
  [key: string]: any
}

type AuctionStateRow = {
  current_player_id: number | null
}

type RealtimePayload<T> = {
  eventType: "INSERT" | "UPDATE" | "DELETE" | string
  new: T | null
  old: T | null
}

export function useRealtimeAuction(initialData: AuctionData) {
  const [data, setData] = useState<AuctionData>(initialData)
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)

  useEffect(() => {
    const channels: RealtimeChannel[] = []

    const updateTimestamp = () => {
      setLastUpdate(
        new Date().toLocaleTimeString("en-US", {
          hour12: true,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      )
    }

    /*
     * =========================================================
     * PLAYERS REALTIME
     * =========================================================
     *
     * We use the realtime payload directly.
     * We do NOT refetch the entire players table every time.
     */
    const playersChannel = supabase
      .channel("players-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
        },
        (payload: RealtimePayload<PlayerRow>) => {
          const newPlayer = payload.new
          const oldPlayer = payload.old

          setData((prev) => {
            let updatedPlayers = [...prev.players]

            // INSERT
            if (payload.eventType === "INSERT" && newPlayer) {
              updatedPlayers.push(newPlayer)
            }

            // UPDATE
            if (payload.eventType === "UPDATE" && newPlayer) {
              updatedPlayers = updatedPlayers.map((player) =>
                player.id === newPlayer.id
                  ? {
                      ...player,
                      ...newPlayer,
                    }
                  : player,
              )
            }

            // DELETE
            if (payload.eventType === "DELETE" && oldPlayer) {
              updatedPlayers = updatedPlayers.filter(
                (player) => player.id !== oldPlayer.id,
              )
            }

            // Keep players sorted by name
            updatedPlayers.sort((a, b) =>
              String(a.name || "").localeCompare(
                String(b.name || ""),
              ),
            )

            return {
              ...prev,
              players: updatedPlayers,
            }
          })

          updateTimestamp()
        },
      )
      .subscribe((status: string) => {
        console.log("Players realtime status:", status)
      })

    channels.push(playersChannel)

    /*
     * =========================================================
     * ASSIGNMENTS REALTIME
     * =========================================================
     *
     * We refetch assignments because the UI needs the latest
     * assignment list for player counts and assignment details.
     */
    const assignmentsChannel = supabase
      .channel("assignments-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "assignments",
        },
        async (_payload: RealtimePayload<any>) => {
          try {
            const {
              data: assignments,
              error,
            } = await supabase
              .from("assignments")
              .select(`
                id,
                player_id,
                team_id,
                final_price,
                assigned_at,
                player:players(
                  id,
                  name,
                  position,
                  image,
                  city,
                  previous_team,
                  base_price
                ),
                team:teams(
                  id,
                  name,
                  team_logo
                )
              `)
              .order("assigned_at", {
                ascending: false,
              })

            if (error) {
              console.error(
                "Failed to refresh assignments:",
                error,
              )
              return
            }

            setData((prev) => ({
              ...prev,
              assignments: assignments || [],
            }))

            updateTimestamp()
          } catch (error) {
            console.error(
              "Assignment realtime refresh error:",
              error,
            )
          }
        },
      )
      .subscribe((status: string) => {
        console.log("Assignments realtime status:", status)
      })

    channels.push(assignmentsChannel)

    /*
     * =========================================================
     * TEAMS REALTIME
     * =========================================================
     *
     * Teams are refetched because the database is the source
     * of truth for budgets.
     */
    const teamsChannel = supabase
      .channel("teams-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "teams",
        },
        async (_payload: RealtimePayload<TeamRow>) => {
          try {
            const {
              data: teams,
              error,
            } = await supabase
              .from("teams")
              .select(`
                id,
                name,
                budget,
                team_logo,
                is_pune
              `)
              .order("name")

            if (error) {
              console.error(
                "Failed to refresh teams:",
                error,
              )
              return
            }

            setData((prev) => ({
              ...prev,
              teams: (teams || []) as TeamRow[],
            }))

            updateTimestamp()
          } catch (error) {
            console.error(
              "Teams realtime refresh error:",
              error,
            )
          }
        },
      )
      .subscribe((status: string) => {
        console.log("Teams realtime status:", status)
      })

    channels.push(teamsChannel)

    /*
     * =========================================================
     * AUCTION STATE REALTIME
     * =========================================================
     *
     * current_player_id can legitimately be NULL.
     *
     * When it is NULL, clear currentPlayer and DO NOT query
     * the players table with .eq("id", null).
     */
    const auctionStateChannel = supabase
      .channel("auction-state")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "auction_state",
        },
        async (
          payload: RealtimePayload<AuctionStateRow>,
        ) => {
          try {
            const newState = payload.new

            /*
             * No current player.
             */
            if (
              !newState ||
              newState.current_player_id == null
            ) {
              setData((prev) => ({
                ...prev,
                currentPlayer: null,
              }))

              updateTimestamp()
              return
            }

            const currentPlayerId =
              newState.current_player_id

            /*
             * Only query players when we have a valid ID.
             */
            const {
              data: currentPlayerData,
              error,
            } = await supabase
              .from("players")
              .select(`
                id,
                name,
                image,
                position,
                achievement,
                base_price,
                previous_team,
                city
              `)
              .eq("id", currentPlayerId)
              .maybeSingle()

            if (error) {
              console.error(
                "Failed to fetch current player:",
                error,
              )
              return
            }

            setData((prev) => ({
              ...prev,
              currentPlayer:
                currentPlayerData || null,
            }))

            updateTimestamp()
          } catch (error) {
            console.error(
              "Auction state realtime error:",
              error,
            )
          }
        },
      )
      .subscribe((status: string) => {
        console.log(
          "Auction state realtime status:",
          status,
        )
      })

    channels.push(auctionStateChannel)

    /*
     * =========================================================
     * AUCTION OVERVIEW REALTIME
     * =========================================================
     */
    const overviewChannel = supabase
      .channel("auction-overview")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "assignments",
        },
        async (_payload: RealtimePayload<any>) => {
          try {
            const {
              data: auctionOverview,
              error,
            } = await supabase.rpc(
              "get_auction_overview",
            )

            if (error) {
              console.error(
                "Failed to refresh auction overview:",
                error,
              )
              return
            }

            if (auctionOverview) {
              setData((prev) => ({
                ...prev,
                auctionOverview,
              }))

              updateTimestamp()
            }
          } catch (error) {
            console.error(
              "Auction overview realtime error:",
              error,
            )
          }
        },
      )
      .subscribe((status: string) => {
        console.log(
          "Auction overview realtime status:",
          status,
        )
      })

    channels.push(overviewChannel)

    /*
     * =========================================================
     * CONNECTION
     * =========================================================
     */
    setIsConnected(true)

    /*
     * =========================================================
     * CLEANUP
     * =========================================================
     */
    return () => {
      channels.forEach((channel) => {
        void supabase.removeChannel(channel)
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