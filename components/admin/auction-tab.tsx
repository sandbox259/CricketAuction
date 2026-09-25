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
} from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { toast } from "sonner"

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
  const [teams, setTeams] = useState(initialData.teams)
  const [assignments, setAssignments] = useState(initialData.assignments)
  const [isShuffling, setIsShuffling] = useState(false)
  const [isRefreshingData, setIsRefreshingData] = useState(false)
  const [isPlayerPickerOpen, setIsPlayerPickerOpen] = useState(false)
  const [playerSearch, setPlayerSearch] = useState("")
  const playerPickerRef = useRef<HTMLDivElement | null>(null)

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
  const nextRandomPlayer = useCallback(() => {
    if (availablePlayers.length === 0) return null

    const randomIndex = Math.floor(Math.random() * availablePlayers.length)
    return availablePlayers[randomIndex]
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
      if (selectedPlayer.city === "Pune") {
        if (is_pune) {
          toast.error("Team already has a player from Pune")
          return
        }

        const { error: updateError } = await supabase
          .from("teams")
          .update({ is_pune: true })
          .eq("id", teamId)

        if (updateError) {
          console.error("Failed to update is_pune:", updateError)
          toast.error("Failed to update Pune restriction")
          return
        }
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
      // if (finalPriceNumber > budget_remaining) {
      //   toast.error(
      //     `Insufficient budget! Final price: ${formatCurrency(finalPriceNumber)}, Available: ${formatCurrency(budget_remaining)}`
      //   )
      //   return
      // }

      // Constraint 3: team player limit.
      if (remainingSlots <= 0) {
        toast.error("Team has reached maximum player limit")
        return
      }

      // Constraint 4 intentionally remains disabled, matching the existing code.
      // const budgetAfterPurchase = Number(budget_remaining) - finalPriceNumber
      // const minRemainingBudget = (remainingSlots - 1) * 500
      // if (budgetAfterPurchase < minRemainingBudget && remainingSlots > 1) {
      //   ...
      // }

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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Current Player
                    </h3>

                    <Card className="bg-gray-50 border border-gray-200 rounded-xl">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-6 mb-6">
                          <div className="w-2/5 flex-shrink-0">
                            <img
                              src={
                                currentPlayer.image ||
                                `/placeholder.svg?height=200&width=160&query=${encodeURIComponent(
                                  "cricket player " + (currentPlayer.name || ""),
                                )}`
                              }
                              alt={currentPlayer.name}
                              className="w-full h-48 rounded-xl object-contain border-2 border-gray-200 bg-white"
                            />
                          </div>

                          <div className="w-3/5 pl-6">
                            <div className="flex items-center justify-between mb-2 gap-4">
                              <div>
                                <h4 className="text-2xl font-bold text-gray-900">
                                  {currentPlayer.name}
                                </h4>
                                <p className="text-gray-500 font-medium">
                                  {currentPlayer.position}
                                </p>
                              </div>

                              <Badge className="bg-amber-500 text-white px-3 py-1 rounded-full font-medium whitespace-nowrap">
                                Base: {formatCurrency(currentPlayer.base_price)}
                              </Badge>
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
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold btn-scale"
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

                          <div className="relative flex-1" ref={playerPickerRef}>
                            <Button
                              type="button"
                              onClick={() => setIsPlayerPickerOpen((open) => !open)}
                              disabled={isProcessing}
                              variant="outline"
                              className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 font-semibold btn-scale"
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
                                    className="pl-9 bg-white border-gray-200 text-gray-900"
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
                                              {player.name}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                              {player.position || "Player"}
                                              {player.city ? ` • ${player.city}` : ""}
                                            </p>
                                          </div>
                                          <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
                                            {formatCurrency(player.base_price)}
                                          </span>
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
                            className={`font-semibold btn-scale ${
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
                            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-semibold btn-scale"
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

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Assign Player
                    </h3>

                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
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
                          <Badge className="bg-amber-500 text-white shrink-0">
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
                          <SelectTrigger className="bg-white border-gray-200 text-gray-900">
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
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold btn-scale"
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

                        <div className="relative flex-1" ref={playerPickerRef}>
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
                                  className="pl-9 bg-white border-gray-200 text-gray-900"
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
                                            {player.name}
                                          </p>
                                          <p className="text-xs text-gray-500 truncate">
                                            {player.position || "Player"}
                                            {player.city ? ` • ${player.city}` : ""}
                                          </p>
                                        </div>
                                        <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
                                          {formatCurrency(player.base_price)}
                                        </span>
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
        </div>

        {/* Team budgets replace the old Recent Sales panel. */}
        <div className="lg:col-span-1">
          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-gray-900 font-semibold">
                    Team Budgets
                  </CardTitle>
                  <CardDescription className="text-gray-500">
                    Remaining budget after each assignment
                  </CardDescription>
                </div>

                {isRefreshingData && (
                  <Loader2 className="h-4 w-4 text-blue-600 animate-spin shrink-0" />
                )}
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
                {teams.length > 0 ? (
                  teams.map((team) => {
                    const playerCount = assignments.filter(
                      (assignment) => assignment.team_id === team.id,
                    ).length

                    return (
                      <div
                        key={`budget-team-${team.id}`}
                        className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                            {team.team_logo ? (
                              <img
                                src={team.team_logo}
                                alt={team.name}
                                className="w-9 h-9 object-contain"
                              />
                            ) : (
                              <Users className="h-5 w-5 text-gray-400" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {team.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {playerCount} {playerCount === 1 ? "player" : "players"}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-lg font-bold text-gray-900">
                            {formatCurrency(team.budget)}
                          </p>
                          <p className="text-xs text-gray-500">Remaining</p>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    No teams found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-gray-900 font-medium">Available Players</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {availablePlayers.length}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              <span className="text-gray-900 font-medium">
                Total Remaining Budget
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {formatCurrency(totalRemainingBudget)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-gray-900 font-medium">Players Sold</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {assignments.length}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
