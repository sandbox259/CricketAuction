"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Gavel,
  DollarSign,
  Users,
  Clock,
  ArrowRight,
  Loader2,
  Shuffle,
  Search,
  UserRound,
  Gem,
  Medal,
  Star,
  X,
} from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { toast } from "sonner"
import JewelReveal from "@/components/animations/JewelReveal"
import TreasureReveal from "@/components/animations/TreasureReveal"
import SuperstarReveal from "@/components/animations/SuperstarReveal"

interface AuctionTabProps {
  initialData: {
    teams: any[]
    players: any[]
    assignments: any[]
  }
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)

const HIGHLIGHT_DURATION_MS = 3000

// Keep these as independent arrays so a player can belong to multiple
// categories at the same time.
const JEWEL_PLAYER_IDS: number[] = [
  103,
  145,
  141,
  136,
  281,
  130,
  33,
  51,
  88,
  101,
  47,
  91,
  90,
  99,
  105,
  // 101,
  // 105,
]

const TREASURE_PLAYER_IDS: number[] = [
  27,
  81,
  59,
  60,
  118,
  26,
  278,
  66,
  42,
  279,
  53,
  286,
  46,
  146,
  76,
  84,
  // 203,
  // 214,
]

const SUPERSTAR_PLAYER_IDS: number[] = [
  81,
  111,
  283,
  141,
  104,
  49,
  115,
  60,
  69,
  // 301,
  // 308,
]

type PlayerHighlight = "jewel" | "treasure" | "superstar"

function getPlayerHighlights(playerId: unknown): PlayerHighlight[] {
  if (playerId === null || playerId === undefined) {
    return []
  }

  const id = Number(playerId)
  const highlights: PlayerHighlight[] = []

  if (SUPERSTAR_PLAYER_IDS.includes(id)) {
    highlights.push("superstar")
  }

  if (JEWEL_PLAYER_IDS.includes(id)) {
    highlights.push("jewel")
  }

  if (TREASURE_PLAYER_IDS.includes(id)) {
    highlights.push("treasure")
  }

  return highlights
}

function getRevealHighlight(
  highlights: PlayerHighlight[],
): PlayerHighlight | null {
  if (highlights.includes("superstar")) return "superstar"
  if (highlights.includes("jewel")) return "jewel"
  if (highlights.includes("treasure")) return "treasure"
  return null
}

function getPlayerCardTheme(highlight: PlayerHighlight | null) {
  switch (highlight) {
    case "superstar":
      return {
        card: "border-blue-300 bg-gradient-to-br from-white via-blue-50/50 to-indigo-50/50 ring-2 ring-blue-200/70 shadow-[0_10px_35px_rgba(37,99,235,0.14)]",
        image: "border-blue-300 ring-2 ring-blue-100 shadow-[0_8px_24px_rgba(37,99,235,0.16)]",
        label: "border-blue-200 bg-blue-50 text-blue-700",
      }
    case "jewel":
      return {
        card: "border-amber-300 bg-gradient-to-br from-white via-amber-50/40 to-yellow-50/50 ring-2 ring-amber-200/70 shadow-[0_10px_35px_rgba(245,158,11,0.16)]",
        image: "border-amber-300 ring-2 ring-amber-100 shadow-[0_8px_24px_rgba(245,158,11,0.18)]",
        label: "border-amber-200 bg-amber-50 text-amber-700",
      }
    case "treasure":
      return {
        card: "border-slate-300 bg-gradient-to-br from-white via-slate-50/50 to-gray-100/60 ring-2 ring-slate-200/70 shadow-[0_10px_35px_rgba(100,116,139,0.14)]",
        image: "border-slate-300 ring-2 ring-slate-100 shadow-[0_8px_24px_rgba(100,116,139,0.16)]",
        label: "border-slate-200 bg-slate-50 text-slate-700",
      }
    default:
      return {
        card: "border-blue-100 bg-gradient-to-br from-white via-white to-blue-50/40 shadow-[0_8px_30px_rgba(15,23,42,0.06)]",
        image: "border-blue-200 ring-1 ring-blue-100 shadow-sm",
        label: "border-blue-100 bg-blue-50 text-blue-700",
      }
  }
}

function PlayerHighlightBadges({
  highlights,
}: {
  highlights: PlayerHighlight[]
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {highlights.includes("superstar") && (
        <Badge
          className="shrink-0 rounded-full border border-yellow-300 bg-gradient-to-r from-amber-100 via-yellow-50 to-yellow-200 px-2.5 py-1 text-[10px] font-black tracking-wide text-amber-700 shadow-sm"
        >
          <Star className="mr-1 h-3 w-3 fill-amber-500 text-amber-500" />
          SUPERSTAR
        </Badge>
      )}

      {highlights.includes("jewel") && (
        <Badge
          className="shrink-0 rounded-full border border-yellow-300 bg-gradient-to-r from-yellow-100 via-yellow-50 to-amber-100 px-2.5 py-1 text-[10px] font-black tracking-wide text-yellow-700 shadow-sm"
        >
          <Gem className="mr-1 h-3 w-3" />
          JEWEL
        </Badge>
      )}

      {highlights.includes("treasure") && (
        <Badge
          className="shrink-0 rounded-full border border-slate-300 bg-gradient-to-r from-slate-100 via-white to-slate-200 px-2.5 py-1 text-[10px] font-black tracking-wide text-slate-600 shadow-sm"
        >
          <Medal className="mr-1 h-3 w-3" />
          TREASURE
        </Badge>
      )}
    </div>
  )
}

export default function AuctionTab({ initialData }: AuctionTabProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null)
  const [selectedTeam, setSelectedTeam] = useState("")
  const [finalPrice, setFinalPrice] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)
  const [isMarkingUnsold, setIsMarkingUnsold] = useState(false)
  const [playersData, setPlayersData] = useState(initialData.players)
  const [isRecycling, setIsRecycling] = useState(false)
  const [currentPlayer, setCurrentPlayer] = useState<any | null>(null)
  const [showReveal, setShowReveal] = useState(false)
  const [teams, setTeams] = useState(initialData.teams)
  const [assignments, setAssignments] = useState(initialData.assignments)
  const [isShuffling, setIsShuffling] = useState(false)
  const [isRefreshingData, setIsRefreshingData] = useState(false)
  const [isPlayerPickerOpen, setIsPlayerPickerOpen] = useState(false)
  const [playerSearch, setPlayerSearch] = useState("")
  const [isPlayerImageOpen, setIsPlayerImageOpen] = useState(false)
  const playerPickerRef = useRef<HTMLDivElement | null>(null)

  const playerHighlights = useMemo(
    () => getPlayerHighlights(currentPlayer?.id),
    [currentPlayer?.id],
  )

  const revealHighlight = useMemo(
    () => getRevealHighlight(playerHighlights),
    [playerHighlights],
  )

  const playerCardTheme = useMemo(
    () => getPlayerCardTheme(revealHighlight),
    [revealHighlight],
  )

  // Trigger the reveal whenever the player ID changes.
  // Superstar takes priority over Jewel, then Treasure.
  useEffect(() => {
    setShowReveal(false)

    if (!currentPlayer?.id || !revealHighlight) {
      return
    }

    setShowReveal(true)

    const timer = window.setTimeout(() => {
      setShowReveal(false)
    }, HIGHLIGHT_DURATION_MS)

    return () => window.clearTimeout(timer)
  }, [currentPlayer?.id, revealHighlight])

  const availablePlayers = useMemo(
    () => playersData.filter((p) => p.status === "available"),
    [playersData],
  )

  const unsoldPlayers = useMemo(
    () => playersData.filter((p) => p.status === "unsold"),
    [playersData],
  )

  const filteredPlayers = useMemo(() => {
    const query = playerSearch.trim().toLowerCase()

    if (!query) {
      return availablePlayers
    }

    return availablePlayers.filter((player) => {
      const searchableText = [
        player.auction_number?.toString(),
        player.name,
        player.position,
        player.city,
        player.previous_team,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return searchableText.includes(query)
    })
  }, [availablePlayers, playerSearch])

  // Keep local auction state synchronized when the parent realtime data changes.
  useEffect(() => {
    setTeams(initialData.teams || [])
    setPlayersData(initialData.players || [])
    setAssignments(initialData.assignments || [])
  }, [initialData.teams, initialData.players, initialData.assignments])

  // Close the player picker when clicking outside it.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        playerPickerRef.current &&
        !playerPickerRef.current.contains(event.target as Node)
      ) {
        setIsPlayerPickerOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Lightbox controls: Escape closes it and the page stays fixed while open.
  useEffect(() => {
    if (!isPlayerImageOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsPlayerImageOpen(false)
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isPlayerImageOpen])

  // Close the lightbox automatically when the auction player changes.
  useEffect(() => {
    setIsPlayerImageOpen(false)
  }, [currentPlayer?.id])

  const refreshAuctionData = useCallback(async () => {
    setIsRefreshingData(true)

    try {
      // Fetch each dataset independently so one query failure does not
      // prevent the other authoritative data from reaching the UI.
      const [teamsResult, playersResult, assignmentsResult] = await Promise.all([
        supabase
          .from("teams")
          .select("id, name, budget, team_logo, is_pune")
          .order("name"),

        // Explicitly request only the columns used by the auction screen.
        // This avoids unnecessary fields and keeps available/sold/unsold
        // state driven by the database's status column.
        supabase
          .from("players")
          .select(`
            auction_number,
            id,
            name,
            status,
            position,
            image,
            base_price,
            achievement,
            city,
            previous_team
          `)
          .order("name"),

        // assignments.created_at does not exist in this schema; use
        // assigned_at and avoid nested player/team joins for this refresh.
        supabase
          .from("assignments")
          .select(`
            id,
            player_id,
            team_id,
            final_price,
            assigned_at
          `)
          .order("assigned_at", { ascending: false }),
      ])

      if (teamsResult.error) {
        throw new Error(`Teams refresh failed: ${teamsResult.error.message}`)
      }

      if (playersResult.error) {
        console.error("Players refresh failed:", playersResult.error)
        throw new Error(`Players refresh failed: ${playersResult.error.message}`)
      }

      if (assignmentsResult.error) {
        throw new Error(
          `Assignments refresh failed: ${assignmentsResult.error.message}`,
        )
      }

      setTeams(teamsResult.data || [])
      setPlayersData(playersResult.data || [])
      setAssignments(assignmentsResult.data || [])
    } catch (error: any) {
      console.error("Error refreshing auction data:", error)
      throw new Error(error?.message || "Failed to refresh auction data")
    } finally {
      setIsRefreshingData(false)
    }
  }, [])

  // Fetch authoritative data once when the auction tab mounts.
  useEffect(() => {
    const loadFreshData = async () => {
      try {
        await refreshAuctionData()
      } catch (error: any) {
        console.error("Initial auction data refresh failed:", error)
      }
    }

    void loadFreshData()
  }, [refreshAuctionData])

  // Helper function to pick a random available player.
  // const nextRandomPlayer = useCallback(() => {
  //   if (availablePlayers.length === 0) return null

  //   const randomIndex = Math.floor(Math.random() * availablePlayers.length)
  //   return availablePlayers[randomIndex]
  // }, [availablePlayers])

  const nextRandomPlayer = useCallback(() => {
  if (availablePlayers.length === 0) return null

  // Force player 154 once 19 or fewer players remain.
  if (availablePlayers.length <= 19) {
    const forcedPlayer = availablePlayers.find((p) => p.id === 154)

    if (forcedPlayer) {
      return forcedPlayer
    }
  }

  // Force player 73 once 12 or fewer players remain.
  if (availablePlayers.length <= 12) {
    const forcedPlayer = availablePlayers.find((p) => p.id === 73)

    if (forcedPlayer) {
      return forcedPlayer
    }
  }

  // Keep both special players out of normal random selection.
  const filteredPlayers = availablePlayers.filter(
    (p) => p.id !== 154 && p.id !== 73,
  )

  const pool = filteredPlayers.length > 0
    ? filteredPlayers
    : availablePlayers

  const randomIndex = Math.floor(Math.random() * pool.length)

  return pool[randomIndex]
}, [availablePlayers])

  const persistCurrentPlayer = useCallback(async (player: any | null) => {
    const { error } = await supabase
      .from("auction_state")
      .update({ current_player_id: player ? player.id : null })
      .eq("id", 1)

    if (error) {
      throw error
    }
  }, [])

  // Recycling unsold players when no available players are left.
  useEffect(() => {
    const recycleUnsoldPlayers = async () => {
      if (
        availablePlayers.length === 0 &&
        unsoldPlayers.length > 0 &&
        !isProcessing &&
        !isRecycling
      ) {
        console.log(
          "No available players, recycling",
          unsoldPlayers.length,
          "unsold players...",
        )
        setIsRecycling(true)

        try {
          const { error } = await supabase
            .from("players")
            .update({ status: "available" })
            .eq("status", "unsold")

          if (error) throw error

          await refreshAuctionData()

          toast.success(
            `Recycled ${unsoldPlayers.length} unsold players back to auction pool`,
          )
        } catch (error: any) {
          console.error("Error recycling unsold players:", error?.message)
          toast.error("Failed to recycle unsold players")
        } finally {
          setIsRecycling(false)
        }
      }
    }

    const timeoutId = setTimeout(recycleUnsoldPlayers, 500)

    return () => clearTimeout(timeoutId)
  }, [
    availablePlayers.length,
    unsoldPlayers.length,
    isProcessing,
    isRecycling,
    refreshAuctionData,
  ])

  // Shuffle button handler - chooses a random available player,
  // makes them the current player, and persists that state.
  const handleShuffle = async () => {
    if (isShuffling || isProcessing) return

    setIsShuffling(true)
    setIsProcessing(true)

    try {
      const next = nextRandomPlayer()

      if (!next) {
        setCurrentPlayer(null)
        setSelectedPlayer(null)
        await persistCurrentPlayer(null)
        toast.info("No more players available")
        return
      }

      await persistCurrentPlayer(next)

      setCurrentPlayer(next)
      setSelectedPlayer(null)
      setPlayerSearch("")
      toast.success(`New player: ${next.name}`)
    } catch (error: any) {
      console.error("Shuffle error:", error)
      toast.error(error?.message || "An error occurred during shuffle")
    } finally {
      setIsShuffling(false)
      setIsProcessing(false)
    }
  }

  // Manual player selection handler. Selecting a player immediately
  // makes that player the current player in the auction.
  const handleSelectPlayer = async (player: any) => {
    if (!player || isProcessing) return

    setIsProcessing(true)

    try {
      await persistCurrentPlayer(player)

      setCurrentPlayer(player)
      setSelectedPlayer(null)
      setIsPlayerPickerOpen(false)
      setPlayerSearch("")

      toast.success(`Selected player: ${player.name}`)
    } catch (error: any) {
      console.error("Select player error:", error)
      toast.error(error?.message || "Failed to select player")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAssignPlayer = async () => {
    if (isProcessing) return

    if (!selectedPlayer || !selectedTeam || !finalPrice) {
      toast.error("Please select player, team, and enter final price")
      return
    }

    const finalPriceNumber = Number.parseFloat(finalPrice)

    if (Number.isNaN(finalPriceNumber) || finalPriceNumber <= 0) {
      toast.error("Please enter a valid final price")
      return
    }

    setIsAssigning(true)
    setIsProcessing(true)

    try {
      const teamId = Number.parseInt(selectedTeam, 10)

      // Fetch the authoritative team summary immediately before assignment.
      const { data: teamData, error: teamError } = await supabase.rpc(
        "get_team_summary",
        { p_team_id: teamId },
      )

      if (teamError) {
        console.error("Team summary error:", teamError)
        throw new Error("Failed to fetch team data")
      }

      if (!teamData) {
        throw new Error("Team data not found")
      }

      console.log("Team data received:", teamData)

      const { budget_remaining, is_pune } = teamData

      const purchasedPlayersCount = assignments.filter(
        (assignment) => assignment.team_id === teamId,
      ).length
      const remainingSlots = 12 - purchasedPlayersCount

      console.log("Assignment validation:", {
        finalPrice: finalPriceNumber,
        basePrice: selectedPlayer.base_price,
        budgetRemaining: budget_remaining,
        purchasedPlayers: purchasedPlayersCount,
        remainingSlots,
      })

      // Constraint: only one player from Pune allowed per team.
      // if (selectedPlayer.city === "Pune") {
      //   if (is_pune) {
      //     toast.error("Team already has a player from Pune")
      //     return
      //   }

      //   const { error: updateError } = await supabase
      //     .from("teams")
      //     .update({ is_pune: true })
      //     .eq("id", teamId)

      //   if (updateError) {
      //     console.error("Failed to update is_pune:", updateError)
      //     toast.error("Failed to update Pune restriction")
      //     return
      //   }
      // }

      if (selectedPlayer.city === "Pune") {
          if (Number(is_pune) >= 2) {
            toast.error("Team already has the maximum 2 Pune players")
            return
          }

          // const { error: updateError } = await supabase
          //   .from("teams")
          //   .update({
          //     is_pune: Number(is_pune) + 1,
          //   })
          //   .eq("id", teamId)

          // if (updateError) {
          //   console.error("Failed to update Pune player count:", updateError)
          //   toast.error("Failed to update Pune player limit")
          //   return
          // }
        }

      // Constraint 1: final price must be at least the base price.
      if (finalPriceNumber < Number(selectedPlayer.base_price || 0)) {
        toast.error(
          `Final price must be at least ${formatCurrency(selectedPlayer.base_price)}`,
        )
        return
      }

      // Constraint 2 is intentionally left as it was in the existing flow.
      // The database RPC remains responsible for the authoritative assignment.
      if (finalPriceNumber > budget_remaining) {
        toast.error(
          `Insufficient budget! Final price: ${formatCurrency(finalPriceNumber)}, Available: ${formatCurrency(budget_remaining)}`
        )
        return
      }

      // Constraint 3: team player limit.
      if (remainingSlots <= 0) {
        toast.error("Team has reached maximum player limit")
        return
      }

      // Constraint 4 intentionally remains disabled, matching the existing code.
      const budgetAfterPurchase = Number(budget_remaining) - finalPriceNumber
      const minRemainingBudget = (remainingSlots - 1) * 1000
      if (budgetAfterPurchase < minRemainingBudget && remainingSlots > 1) {
        toast.error(
          `Insufficient budget for remaining slots! After this purchase, team will have ${formatCurrency(
            budgetAfterPurchase,
          )} left for ${remainingSlots - 1} remaining slots (minimum required: ${formatCurrency(
            minRemainingBudget,
          )})`,
        )
        return
      }

      const { data, error } = await supabase.rpc("assign_player_to_team", {
        p_player_id: selectedPlayer.id,
        p_team_id: teamId,
        p_final_price: finalPriceNumber,
      })

      if (error) {
        console.error("Assignment error:", error)
        throw new Error("Failed to assign player")
      }

      if (!data?.success) {
        toast.error(data?.error || "Failed to assign player")
        return
      }

      // The assignment has succeeded in the database.
      // Update the current browser immediately, then refresh authoritative
      // teams/players/assignments from Supabase.
      setPlayersData((prev) =>
        prev.map((player) =>
          player.id === selectedPlayer.id
            ? { ...player, status: "sold" }
            : player,
        ),
      )

      setSelectedPlayer(null)
      setSelectedTeam("")
      setFinalPrice("")
      setCurrentPlayer(null)

      // Clear the current player in the shared auction state as well.
      try {
        await persistCurrentPlayer(null)
      } catch (currentPlayerError) {
        console.error("Failed to clear current auction player:", currentPlayerError)
      }

      // Refresh the database state. This is what updates the authoritative
      // team budget and assignment count, instead of calculating budget locally.
      try {
        await refreshAuctionData()
        toast.success("Player assigned successfully!")
      } catch (refreshError: any) {
        console.error("Assignment succeeded but refresh failed:", refreshError)
        toast.success("Player assigned successfully")
        toast.error(
          refreshError?.message ||
            "Could not refresh auction data. Please refresh the page.",
        )
      }
    } catch (error: any) {
      console.error("Assignment error:", error)
      toast.error(error?.message || "An error occurred")
    } finally {
      setIsAssigning(false)
      setIsProcessing(false)
    }
  }

  const handleMarkUnsold = async (playerId: number) => {
    if (isProcessing) return

    setIsMarkingUnsold(true)
    setIsProcessing(true)

    try {
      const { data, error } = await supabase.rpc("mark_player_unsold", {
        p_player_id: playerId,
      })

      if (error) throw error

      if (!data?.success) {
        toast.error(data?.error || "Failed to mark player as unsold")
        return
      }

      // Keep the local player pool immediately in sync with the successful RPC.
      setPlayersData((prev) =>
        prev.map((player) =>
          player.id === playerId
            ? { ...player, status: "unsold" }
            : player,
        ),
      )

      setCurrentPlayer(null)
      setSelectedPlayer(null)

      try {
        await persistCurrentPlayer(null)
      } catch (currentPlayerError) {
        console.error("Failed to clear current auction player:", currentPlayerError)
      }

      try {
        await refreshAuctionData()
        toast.success("Player marked as unsold")
      } catch (refreshError: any) {
        console.error("Unsold update succeeded but refresh failed:", refreshError)
        toast.success("Player marked as unsold")
        toast.error(
          refreshError?.message ||
            "Could not refresh auction data. Please refresh the page.",
        )
      }
    } catch (error: any) {
      console.error("Mark unsold error:", error)
      toast.error(error?.message || "An error occurred")
    } finally {
      setIsMarkingUnsold(false)
      setIsProcessing(false)
    }
  }

  const selectedPlayerForAuction = useMemo(() => {
    if (!selectedPlayer) return null

    return selectedPlayer
  }, [selectedPlayer])

  const totalRemainingBudget = useMemo(
    () =>
      teams.reduce(
        (sum, team) => sum + Number(team.budget || 0),
        0,
      ),
    [teams],
  )

  const budgetTeams = useMemo(
    () =>
      teams.filter(
        (team) => team.name?.trim().toLowerCase() !== "reserves",
      ),
    [teams],
  )

  return (
    <div className="space-y-6 rounded-3xl bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-2 sm:p-3">
      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3 lg:gap-6">
        <div className="flex flex-col gap-4 lg:col-span-2 lg:min-h-[620px]">
          <Card className="rounded-2xl border border-blue-100 bg-gradient-to-br from-white via-white to-blue-50/40 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center font-semibold">
                <Gavel className="h-5 w-5 mr-2 text-amber-500" />
                Live Auction Control
              </CardTitle>
              <CardDescription className="text-gray-500">
                Manage the current auction session
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {currentPlayer ? (
                <div className="space-y-6">
                  <div className="slide-in">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200">
                        <Gavel className="h-4 w-4" />
                      </span>
                      <span>Current Player</span>
                      <span className="ml-auto rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                        On Stage
                      </span>
                    </h3>

                    <Card className={`relative overflow-visible rounded-2xl border bg-white ${playerCardTheme.card}`}>
                      {showReveal && revealHighlight && (
                        <div
                          className="pointer-events-none absolute inset-0 z-30 overflow-hidden rounded-xl"
                          aria-hidden="true"
                        >
                          {revealHighlight === "superstar" && (
                            <SuperstarReveal durationMs={HIGHLIGHT_DURATION_MS} />
                          )}

                          {revealHighlight === "jewel" && (
                            <JewelReveal durationMs={HIGHLIGHT_DURATION_MS} />
                          )}

                          {revealHighlight === "treasure" && (
                            <TreasureReveal durationMs={HIGHLIGHT_DURATION_MS} />
                          )}
                        </div>
                      )}

                      <CardContent className="relative z-10 p-6">
                        <div className="flex items-start space-x-6 mb-6">
                          <div className="w-2/5 flex-shrink-0 rounded-2xl bg-white/70 p-1.5">
                            <button
                              type="button"
                              onClick={() => setIsPlayerImageOpen(true)}
                              className="group relative block w-full rounded-xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                              aria-label={`View ${currentPlayer.name || "player"} photo`}
                            >
                              <img
                                src={
                                  currentPlayer.image ||
                                  `/placeholder.svg?height=200&width=160&query=${encodeURIComponent(
                                    "cricket player " + (currentPlayer.name || ""),
                                  )}`
                                }
                                alt={currentPlayer.name}
                                className={`h-48 w-full cursor-zoom-in rounded-xl border-2 bg-white object-contain transition-transform duration-200 group-hover:scale-[1.01] ${playerCardTheme.image}`}
                              />

                              <div className="pointer-events-none absolute inset-x-2 bottom-2 rounded-lg bg-black/55 px-3 py-1.5 text-center text-[10px] font-semibold tracking-wide text-white opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
                                Click to view photo
                              </div>
                            </button>
                          </div>

                          <div className="w-3/5 pl-6">
                            <div className="flex items-start justify-between mb-2 gap-4">
                              <div className="min-w-0">
                                <h4 className="text-2xl font-black tracking-tight text-gray-950 sm:text-3xl">
                                  {currentPlayer.name}
                                </h4>
                                <p className="mt-1 text-sm font-semibold uppercase tracking-[0.12em] text-blue-600">
                                  {currentPlayer.position}
                                </p>

                                {playerHighlights.length > 0 && (
                                  <div className="mt-2">
                                    <PlayerHighlightBadges highlights={playerHighlights} />
                                  </div>
                                )}
                              </div>

                              <div className="shrink-0 rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-2 text-right shadow-sm">
                                <p className="text-[9px] font-bold uppercase tracking-wider text-amber-700">
                                  Base Price
                                </p>
                                <p className="mt-0.5 text-lg font-black text-gray-900">
                                  {formatCurrency(currentPlayer.base_price)}
                                </p>
                              </div>
                            </div>

                            {currentPlayer.achievement && (
                              <div className="mt-3">
                                <Badge
                                  variant="outline"
                                  className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1 rounded-full whitespace-normal break-words max-w-full"
                                >
                                  🏆 {currentPlayer.achievement}
                                </Badge>
                              </div>
                            )}

                            {currentPlayer.city && (
                              <div className="mt-2">
                                <Badge
                                  variant="outline"
                                  className="bg-green-50 text-green-700 border-green-200 px-3 py-1 rounded-full whitespace-normal break-words max-w-full"
                                >
                                  📍 {currentPlayer.city}
                                </Badge>
                              </div>
                            )}

                            {currentPlayer.previous_team && (
                              <div className="mt-2">
                                <Badge
                                  variant="outline"
                                  className="bg-purple-50 text-purple-700 border-purple-200 px-3 py-1 rounded-full whitespace-normal break-words max-w-full"
                                >
                                  👥 {currentPlayer.previous_team}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button
                            onClick={handleShuffle}
                            disabled={isProcessing}
                            className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 font-semibold text-white shadow-sm shadow-blue-200 hover:from-blue-700 hover:to-blue-800 btn-scale"
                          >
                            {isShuffling ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Shuffling...
                              </>
                            ) : (
                              <>
                                <Shuffle className="h-4 w-4 mr-2" />
                                Shuffle Player
                              </>
                            )}
                          </Button>

                          <div className="relative z-50 flex-1" ref={playerPickerRef}>
                            <Button
                              type="button"
                              onClick={() => setIsPlayerPickerOpen((open) => !open)}
                              disabled={isProcessing}
                              variant="outline"
                              className="w-full rounded-xl border-blue-200 bg-white text-blue-700 shadow-sm hover:bg-blue-600 hover:text-white font-semibold btn-scale"
                            >
                              <Search className="h-4 w-4 mr-2" />
                              Select Player
                            </Button>

                            {isPlayerPickerOpen && (
                              <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-xl border border-gray-200 bg-white shadow-xl p-3">
                                <div className="relative mb-3">
                                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                  <Input
                                    autoFocus
                                    value={playerSearch}
                                    onChange={(event) => setPlayerSearch(event.target.value)}
                                    placeholder="Search player, city, position..."
                                    className="border-blue-100 bg-white text-gray-900 shadow-sm pl-9"
                                  />
                                </div>

                                <div className="max-h-64 overflow-y-auto space-y-1">
                                  {filteredPlayers.length > 0 ? (
                                    filteredPlayers.map((player) => (
                                      <button
                                        key={`picker-${player.id}`}
                                        type="button"
                                        onClick={() => void handleSelectPlayer(player)}
                                        className="w-full rounded-lg px-3 py-2 text-left hover:bg-blue-50 transition-colors"
                                      >
                                        <div className="flex items-center justify-between gap-3">
                                          <div className="min-w-0">
                                            <p className="font-medium text-gray-900 truncate">
                                              {player.auction_number}. {player.name}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                              {player.position || "Player"}
                                              {player.city ? ` • ${player.city}` : ""}
                                            </p>
                                          </div>
                                          {/* <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
                                            {formatCurrency(player.base_price)}
                                          </span> */}
                                        </div>
                                      </button>
                                    ))
                                  ) : (
                                    <div className="py-6 text-center text-sm text-gray-500">
                                      No available players found
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          <Button
                            onClick={() => setSelectedPlayer(currentPlayer)}
                            className={`rounded-xl font-semibold btn-scale ${
                              selectedPlayer?.id === currentPlayer.id
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                : "bg-blue-600 hover:bg-blue-700 text-white"
                            }`}
                            disabled={isProcessing}
                          >
                            <ArrowRight className="h-4 w-4 mr-2" />
                            {selectedPlayer?.id === currentPlayer.id
                              ? "Selected for Auction"
                              : "Select for Auction"}
                          </Button>

                          <Button
                            onClick={() => void handleMarkUnsold(currentPlayer.id)}
                            variant="outline"
                            className="rounded-xl border-red-200 bg-white text-red-500 hover:bg-red-500 hover:text-white font-semibold btn-scale"
                            disabled={isProcessing}
                          >
                            {isMarkingUnsold ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              "Mark Unsold"
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/40 via-white to-amber-50/30 p-4 shadow-sm sm:p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Assign Player</h3>
                        <p className="text-xs text-gray-500">Finalize this auction purchase</p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-blue-100 bg-white/80 p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                            {selectedPlayerForAuction?.image ? (
                              <img
                                src={selectedPlayerForAuction.image}
                                alt={selectedPlayerForAuction.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <UserRound className="h-5 w-5 text-gray-400" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs text-gray-500">Selected player</p>
                            <p className="font-semibold text-gray-900 truncate">
                              {selectedPlayerForAuction?.name ||
                                "Select this player for auction first"}
                            </p>
                          </div>
                        </div>

                        {selectedPlayerForAuction && (
                          <Badge className="shrink-0 rounded-lg border border-amber-200 bg-amber-50 text-amber-800">
                            Base: {formatCurrency(selectedPlayerForAuction.base_price)}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-900 font-medium">
                          Winning Team
                        </Label>
                        <Select
                          value={selectedTeam}
                          onValueChange={setSelectedTeam}
                        >
                          <SelectTrigger className="border-blue-100 bg-white/90 text-gray-900 shadow-sm">
                            <SelectValue placeholder="Select winning team" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border border-gray-200 text-gray-900">
                            {teams.map((team) => (
                              <SelectItem
                                key={`team-${team.id}`}
                                value={team.id.toString()}
                                className="text-gray-900 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-900"
                              >
                                {team.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {selectedTeam && (
                          <p className="text-sm text-gray-500 mt-1">
                            Remaining: {formatCurrency(
                              teams.find(
                                (team) => team.id === Number.parseInt(selectedTeam, 10),
                              )?.budget || 0,
                            )}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label className="text-gray-900 font-medium">
                          Final Price (₹)
                        </Label>
                        <Input
                          type="number"
                          placeholder="Enter final price"
                          value={finalPrice}
                          onChange={(event) => setFinalPrice(event.target.value)}
                          className="bg-white border-gray-200 text-gray-900"
                          min={selectedPlayerForAuction?.base_price || 0}
                        />
                        {selectedPlayerForAuction && (
                          <p className="text-sm text-gray-500 mt-1">
                            Minimum: {formatCurrency(selectedPlayerForAuction.base_price)}
                          </p>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={() => void handleAssignPlayer()}
                      disabled={
                        isProcessing ||
                        !selectedPlayerForAuction ||
                        !selectedTeam ||
                        !finalPrice
                      }
                      className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 font-semibold text-white shadow-sm shadow-blue-200 hover:from-blue-700 hover:to-blue-800 btn-scale"
                    >
                      {isAssigning ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Assigning Player...
                        </>
                      ) : (
                        "Assign Player"
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  {isRecycling ? (
                    <div className="space-y-3">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-amber-500" />
                      <p className="text-gray-900 font-medium">
                        Recycling unsold players...
                      </p>
                      <p className="text-gray-500 text-sm">
                        Making {unsoldPlayers.length} unsold players available for auction again
                      </p>
                    </div>
                  ) : availablePlayers.length > 0 ? (
                    <div className="space-y-4 max-w-xl mx-auto">
                      <p className="text-gray-500">
                        Choose a player to put on the auction board.
                      </p>

                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                          onClick={() => void handleShuffle()}
                          disabled={isProcessing}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold btn-scale px-6"
                        >
                          {isShuffling ? (
                            <>
                              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                              Shuffling...
                            </>
                          ) : (
                            <>
                              <Shuffle className="h-5 w-5 mr-2" />
                              Shuffle Player
                            </>
                          )}
                        </Button>

                        <div className="relative z-50 flex-1" ref={playerPickerRef}>
                          <Button
                            type="button"
                            onClick={() => setIsPlayerPickerOpen((open) => !open)}
                            disabled={isProcessing}
                            variant="outline"
                            className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 font-semibold btn-scale px-6"
                          >
                            <Search className="h-5 w-5 mr-2" />
                            Select Player
                          </Button>

                          {isPlayerPickerOpen && (
                            <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-xl border border-gray-200 bg-white shadow-xl p-3 text-left">
                              <div className="relative mb-3">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                  autoFocus
                                  value={playerSearch}
                                  onChange={(event) => setPlayerSearch(event.target.value)}
                                  placeholder="Search player, city, position..."
                                  className="border-blue-100 bg-white text-gray-900 shadow-sm pl-9"
                                />
                              </div>

                              <div className="max-h-72 overflow-y-auto space-y-1">
                                {filteredPlayers.length > 0 ? (
                                  filteredPlayers.map((player) => (
                                    <button
                                      key={`picker-empty-${player.id}`}
                                      type="button"
                                      onClick={() => void handleSelectPlayer(player)}
                                      className="w-full rounded-lg px-3 py-2 text-left hover:bg-blue-50 transition-colors"
                                    >
                                      <div className="flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                          <p className="font-medium text-gray-900 truncate">
                                            {player.auction_number}. {player.name}
                                          </p>
                                          <p className="text-xs text-gray-500 truncate">
                                            {player.position || "Player"}
                                            {player.city ? ` • ${player.city}` : ""}
                                          </p>
                                        </div>
                                        {/* <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
                                          {formatCurrency(player.base_price)}
                                        </span> */}
                                      </div>
                                    </button>
                                  ))
                                ) : (
                                  <div className="py-6 text-center text-sm text-gray-500">
                                    No available players found
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      No players available for auction
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Compact auction stats fill the space below the live auction panel. */}
          <div className="mt-auto grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card className="rounded-2xl border border-blue-100 bg-gradient-to-br from-white via-white to-blue-50/40 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <Users className="h-4 w-4" />
                  </div>
                  <span className="text-gray-900 font-medium">Available Players</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {availablePlayers.length}
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-amber-100 bg-gradient-to-br from-white via-white to-amber-50/40 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                    <Clock className="h-4 w-4" />
                  </div>
                  <span className="text-gray-900 font-medium">Players Sold</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {assignments.length}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Team budgets align with the full auction/stats column height. */}
        <div className="flex lg:col-span-1">
          <Card className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-b from-white via-white to-blue-50/25 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
            <CardHeader className="border-b border-blue-50 bg-gradient-to-r from-blue-50/70 via-white to-amber-50/35 pb-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-sm font-black tracking-tight text-gray-950">
                      Team Budgets
                    </CardTitle>
                    <CardDescription className="truncate text-[10px] text-gray-500">
                      Remaining auction power
                    </CardDescription>
                  </div>
                </div>

                {isRefreshingData && (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-blue-600" />
                )}
              </div>
            </CardHeader>

            <CardContent className="flex min-h-0 flex-1 pt-2">
              <div className="flex min-h-0 w-full flex-1 flex-col gap-1.5 overflow-hidden">
                {budgetTeams.length > 0 ? (
                  budgetTeams.map((team, index) => {
                    const playerCount = assignments.filter(
                      (assignment) => assignment.team_id === team.id,
                    ).length

                    const maxBudget = Math.max(
                      ...budgetTeams.map((budgetTeam) => Number(budgetTeam.budget || 0)),
                      1,
                    )
                    const budgetPercentage = Math.min(
                      100,
                      (Number(team.budget || 0) / maxBudget) * 100,
                    )

                    return (
                      <div
                        key={`budget-team-${team.id}`}
                        className="group relative flex min-h-0 flex-1 items-center gap-2.5 rounded-xl border border-blue-50 bg-white/90 px-2.5 py-1.5 shadow-[0_2px_10px_rgba(15,23,42,0.025)] transition-all duration-200 hover:border-blue-100 hover:bg-blue-50/45 hover:shadow-sm"
                      >
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-[9px] font-black text-blue-700">
                          {index + 1}
                        </div>

                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-blue-100 bg-gradient-to-br from-white to-blue-50 shadow-sm">
                            {team.team_logo ? (
                              <img
                                src={team.team_logo}
                                alt={team.name}
                                className="h-6 w-6 object-contain"
                              />
                            ) : (
                              <Users className="h-4 w-4 text-gray-400" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate text-[11px] font-bold leading-4 text-gray-900">
                                {team.name}
                              </p>
                              <p className="shrink-0 text-[9px] font-medium text-gray-400">
                                {playerCount}/12
                              </p>
                            </div>

                            <div className="mt-1 h-1 overflow-hidden rounded-full bg-blue-50">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-600 transition-all duration-300"
                                style={{ width: `${budgetPercentage}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="text-sm font-black leading-4 tracking-tight text-blue-950">
                            {formatCurrency(team.budget)}
                          </p>
                          <p className="text-[8px] font-medium uppercase tracking-wider text-gray-400">
                            Remaining
                          </p>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="flex flex-1 items-center justify-center text-sm text-gray-500">
                    No teams found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {isPlayerImageOpen && currentPlayer && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`Photo of ${currentPlayer.name || "player"}`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsPlayerImageOpen(false)
            }
          }}
        >
          <div className="relative flex h-full w-full max-w-6xl items-center justify-center">
            <button
              type="button"
              onClick={() => setIsPlayerImageOpen(false)}
              aria-label="Close player photo"
              className="absolute right-0 top-0 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur-md transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative flex max-h-[90vh] max-w-full flex-col items-center">
              <div className="overflow-hidden rounded-2xl border border-white/15 bg-white/5 p-2 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
                <img
                  src={
                    currentPlayer.image ||
                    `/placeholder.svg?height=900&width=700&query=${encodeURIComponent(
                      "cricket player " + (currentPlayer.name || ""),
                    )}`
                  }
                  alt={currentPlayer.name || "Player"}
                  className="max-h-[76vh] max-w-[92vw] rounded-xl object-contain sm:max-h-[80vh] sm:max-w-[82vw]"
                />
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-center shadow-lg backdrop-blur-md">
                <p className="text-base font-black tracking-tight text-white sm:text-lg">
                  {currentPlayer.name}
                </p>

                {currentPlayer.position && (
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-200 sm:text-xs">
                    {currentPlayer.position}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
