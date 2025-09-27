"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Gavel, DollarSign, Users, Clock, ArrowRight, Loader2, Shuffle } from "lucide-react"
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
  }).format(value)

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

  // Debug: Log the assignments data
  useEffect(() => {
    console.log("Initial assignments:", initialData.assignments)
    console.log("Current assignments state:", assignments)
  }, [])

  // Fetch fresh assignments on component mount if initial data is empty
  useEffect(() => {
    const fetchAssignments = async () => {
      if (assignments.length === 0) {
        try {
          const { data, error } = await supabase
            .from('assignments')
            .select(`
              id,
              player_id,
              team_id,
              final_price,
              created_at,
              player:players(id, name, position, image, city, previous_team),
              team:teams(id, name, team_logo)
            `)
            .order('created_at', { ascending: false })
            .limit(10)
          
          if (error) throw error
          
          if (data && data.length > 0) {
            console.log("Fetched fresh assignments:", data)
            setAssignments(data)
          }
        } catch (error) {
          console.error("Error fetching assignments:", error)
        }
      }
    }

    fetchAssignments()
  }, [])

  const availablePlayers = useMemo(() => playersData.filter((p) => p.status === "available"), [playersData])
  const unsoldPlayers = useMemo(() => playersData.filter((p) => p.status === "unsold"), [playersData])

  // Helper function to pick a random available player
  const nextRandomPlayer = useCallback(() => {
  if (availablePlayers.length === 0) return null;

  // If 4 players remain, try to force player 81
  if (availablePlayers.length === 4) {
    const forcedPlayer = availablePlayers.find((p) => p.id === 81);
    if (forcedPlayer) {
      return forcedPlayer; // ✅ Hard guarantee if he's still around
    }
    // If he's already sold/absent → just continue with normal random
  }

  if (availablePlayers.length === 9) {
    const forcedPlayer1 = availablePlayers.find((p) => p.id === 29);
    if (forcedPlayer1) {
      return forcedPlayer1; // ✅ Hard guarantee if he's still around
    }
    // If he's already sold/absent → just continue with normal random
  }

  // Random choice (exclude 81 until last 4 if he's still present)
  const filteredPlayers = availablePlayers.filter((p) => p.id !== 81 && p.id !== 29);
  const pool = filteredPlayers.length > 0 ? filteredPlayers : availablePlayers;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}, [availablePlayers]);

  // Recycling unsold players when no available players left
  useEffect(() => {
    const recycleUnsoldPlayers = async () => {
      // Only recycle if:
      // 1. No available players
      // 2. There are unsold players  
      // 3. Not currently processing any action
      // 4. Not already recycling
      if (availablePlayers.length === 0 && unsoldPlayers.length > 0 && !isProcessing && !isRecycling) {
        console.log("[v0] No available players, recycling", unsoldPlayers.length, "unsold players...")
        setIsRecycling(true)
        
        try {
          // Update all unsold players to available in database
          const { error } = await supabase
            .from("players")
            .update({ status: "available" })
            .eq("status", "unsold")

          if (error) throw error

          // Fetch updated players data
          const { data: updatedPlayers, error: fetchError } = await supabase
            .from("players")
            .select("*")
            .order("name")

          if (fetchError) throw fetchError

          // Update local state
          setPlayersData(updatedPlayers || [])
          
          console.log("[v0] Successfully recycled", unsoldPlayers.length, "players to available status")
          toast.success(`Recycled ${unsoldPlayers.length} unsold players back to auction pool`)
          
        } catch (error: any) {
          console.error("[v0] Error recycling unsold players:", error.message)
          toast.error("Failed to recycle unsold players")
        } finally {
          setIsRecycling(false)
        }
      }
    }

    // Add a small delay to ensure state updates are complete
    const timeoutId = setTimeout(recycleUnsoldPlayers, 500)
    
    return () => clearTimeout(timeoutId)
  }, [availablePlayers.length, unsoldPlayers.length, isProcessing, isRecycling])

  // Shuffle button handler - sets current player and updates database
  const handleShuffle = async () => {
    if (isShuffling || isProcessing) return

    setIsShuffling(true)
    setIsProcessing(true)

    try {
      const next = nextRandomPlayer()
      
      // Update the current player state
      setCurrentPlayer(next)

      // Persist to Supabase auction_state table
      const { error } = await supabase
        .from("auction_state")
        .update({ current_player_id: next ? next.id : null })
        .eq("id", 1)

      if (error) {
        console.error("Error updating auction state:", error)
        toast.error("Failed to update current player")
      } else {
        if (next) {
          toast.success(`New player: ${next.name}`)
        } else {
          toast.info("No more players available")
        }
      }
    } catch (error: any) {
      console.error("Shuffle error:", error)
      toast.error(error.message || "An error occurred during shuffle")
    } finally {
      setIsShuffling(false)
      setIsProcessing(false)
    }
  }

  const handleAssignPlayer = async () => {
    if (isProcessing) return // Prevent multiple concurrent calls

    if (!selectedPlayer || !selectedTeam || !finalPrice) {
      toast.error("Please select player, team, and enter final price")
      return
    }

    const finalPriceNumber = Number.parseFloat(finalPrice)
    
    if (isNaN(finalPriceNumber) || finalPriceNumber <= 0) {
      toast.error("Please enter a valid final price")
      return
    }

    setIsAssigning(true)
    setIsProcessing(true)

    try {
      // Fetch team summary dynamically
      const { data: teamData, error: teamError } = await supabase.rpc(
        "get_team_summary",
        { p_team_id: Number.parseInt(selectedTeam) }
      )

      if (teamError) {
        console.error("Team summary error:", teamError)
        throw new Error("Failed to fetch team data")
      }
      
      if (!teamData) {
        throw new Error("Team data not found")
      }

      console.log("Team data received:", teamData)

      const { budget_remaining, players_count, is_pune} = teamData
      
      // Calculate purchased players count (excluding captain/vice-captain)
      const purchasedPlayersCount = assignments.filter(a => a.team_id === Number.parseInt(selectedTeam)).length
      const remainingSlots = 12 - purchasedPlayersCount // 11 players max per team (excluding captain/vice-captain)
      const minRemainingBudget = (remainingSlots - 1) * 500 // -1 for the current player being purchased

      console.log("Budget validation:", {
        finalPrice: finalPriceNumber,
        basePrice: selectedPlayer.base_price,
        budgetRemaining: budget_remaining,
        purchasedPlayers: purchasedPlayersCount,
        remainingSlots: remainingSlots,
        minRequired: minRemainingBudget,
        wouldRemainAfterPurchase: budget_remaining - finalPriceNumber
      })

      // New Constraint: Only one player from Pune allowed
        if (selectedPlayer.city === "Pune") {
        if (is_pune) {
          toast.error("Team already has a player from Pune");
          return;
        } else {
          // Mark team as having a Pune player
          const { error: updateError } = await supabase
            .from("teams")
            .update({ is_pune: true })
            .eq("id", Number.parseInt(selectedTeam));

          if (updateError) {
            console.error("Failed to update is_pune:", updateError);
            toast.error("Failed to update Pune restriction");
            return;
          }
        }
      }


      // Constraint 1: finalPrice >= base_price
      if (finalPriceNumber < selectedPlayer.base_price) {
        toast.error(`Final price must be at least ${formatCurrency(selectedPlayer.base_price)}`)
        return
      }

      // Constraint 2: finalPrice <= budget_remaining
      if (finalPriceNumber > budget_remaining) {
        toast.error(
          `Insufficient budget! Final price: ${formatCurrency(finalPriceNumber)}, Available: ${formatCurrency(budget_remaining)}`
        )
        return
      }

      // Constraint 3: Check if team has remaining slots
      if (remainingSlots <= 0) {
        toast.error("Team has reached maximum player limit")
        return
      }

      // Constraint 4: remaining budget >= minimum required for remaining slots
      const budgetAfterPurchase = budget_remaining - finalPriceNumber
      if (budgetAfterPurchase < minRemainingBudget && remainingSlots > 1) {
        toast.error(
          `Cannot assign player. After this purchase, you'll have ${formatCurrency(budgetAfterPurchase)} but need at least ${formatCurrency(minRemainingBudget)} for remaining ${remainingSlots - 1} slots (₹500 minimum each)`
        )
        return
      }

      // Assign player
      const { data, error } = await supabase.rpc("assign_player_to_team", {
        p_player_id: selectedPlayer.id,
        p_team_id: Number.parseInt(selectedTeam),
        p_final_price: finalPriceNumber,
      })

      if (error) {
        console.error("Assignment error:", error)
        throw new Error("Failed to assign player")
      }

      if (data?.success) {
        toast.success("Player assigned successfully!")
        
        // Update players data
        setPlayersData((prev: any[]) =>
          prev.map((p: any) =>
            p.id === selectedPlayer.id ? { ...p, status: "sold" } : p
          )
        )

        // Update assignments list
        const newAssignment = {
          id: Date.now(), // temporary ID
          player_id: selectedPlayer.id,
          team_id: Number.parseInt(selectedTeam),
          final_price: finalPriceNumber,
          player: selectedPlayer,
          team: teams.find(t => t.id === Number.parseInt(selectedTeam))
        }
        setAssignments(prev => [newAssignment, ...prev])

        // Update teams budget
        setTeams((prev) =>
          prev.map((t) =>
            t.id === Number.parseInt(selectedTeam)
              ? { ...t, budget: budgetAfterPurchase }
              : t
          )
        )
        
        // Reset form
        setSelectedPlayer(null)
        setSelectedTeam("")
        setFinalPrice("")

        // Clear current player - user needs to shuffle for next player
        setCurrentPlayer(null)

      } else {
        toast.error(data?.error || "Failed to assign player")
      }
    } catch (error: any) {
      console.error("Assignment error:", error)
      toast.error(error.message || "An error occurred")
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

      if (data?.success) {
        console.log("Player marked as unsold")
        setPlayersData((prev) =>
          prev.map((p) =>
            p.id === playerId ? { ...p, status: "unsold" } : p
          )
        )
        
        // Clear current player - user needs to shuffle for next player
        setCurrentPlayer(null)

        toast.success("Player marked as unsold")
      } else {
        toast.error(data?.error || "Failed to mark player as unsold")
      }
    } catch (error: any) {
      console.error("Mark unsold error:", error)
      toast.error(error.message || "An error occurred")
    } finally {
      setIsMarkingUnsold(false)
      setIsProcessing(false)
    }
  }

  const selectedPlayerValue = useMemo(() => 
    selectedPlayer?.id?.toString() || "", 
    [selectedPlayer?.id]
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
              <CardDescription className="text-gray-500">Manage the current auction session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentPlayer ? (
                <div className="space-y-6">
                  <div className="slide-in">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Player</h3>
                    <Card className="bg-gray-50 border border-gray-200 rounded-xl">
                      <CardContent className="p-6">
                        {/* New layout: Image 40% (w-2/5), Content 60% (w-3/5) */}
                        <div className="flex items-start space-x-6 mb-6">
                          <div className="w-2/5 flex-shrink-0">
                            <img
                              src={
                                currentPlayer.image ||
                                `/placeholder.svg?height=200&width=160&query=${encodeURIComponent(
                                  "cricket player " + (currentPlayer.name || "")
                                )}`
                              }
                              alt={currentPlayer.name}
                              className="w-full h-48 rounded-xl object-contain border-2 border-gray-200"
                            />
                          </div>

                          <div className="w-3/5 pl-6">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="text-2xl font-bold text-gray-900">{currentPlayer.name}</h4>
                                <p className="text-gray-500 font-medium">{currentPlayer.position}</p>
                              </div>
                              <Badge className="bg-amber-500 text-white px-3 py-1 rounded-full font-medium">
                                Base: {formatCurrency(currentPlayer.base_price)}
                              </Badge>
                            </div>

                            {/* Achievement badge - wraps correctly */}
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

                            {/* City badge */}
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

                            {/* Previous team badge */}
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

                        <div className="flex space-x-3">
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
                                Shuffle
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => setSelectedPlayer(currentPlayer)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold btn-scale"
                            disabled={isProcessing}
                          >
                            <ArrowRight className="h-4 w-4 mr-2" />
                            Select for Auction
                          </Button>
                          <Button
                            onClick={() => handleMarkUnsold(currentPlayer.id)}
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
                    <h3 className="text-lg font-semibold text-gray-900">Assign Player</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-gray-900 font-medium">Selected Player</Label>
                        <Select
                          value={selectedPlayerValue}
                          onValueChange={(value) => {
                            const player = availablePlayers.find((p) => p.id.toString() === value)
                            setSelectedPlayer(player || null)
                          }}
                        >
                          <SelectTrigger className="bg-white border-gray-200 text-gray-900">
                            <SelectValue placeholder="Select a player" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border border-gray-200 text-gray-900">
                            {availablePlayers.map((player) => (
                              <SelectItem
                                key={`player-${player.id}`}
                                value={player.id.toString()}
                                className="text-gray-900 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-900"
                              >
                                {player.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-gray-900 font-medium">Winning Team</Label>
                        <Select value={selectedTeam} onValueChange={setSelectedTeam}>
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
                      </div>

                      <div>
                        <Label className="text-gray-900 font-medium">Final Price (₹)</Label>
                        <Input
                          type="number"
                          placeholder="Enter final price"
                          value={finalPrice}
                          onChange={(e) => setFinalPrice(e.target.value)}
                          className="bg-white border-gray-200 text-gray-900"
                          min={selectedPlayer?.base_price || 0}
                        />
                        {selectedPlayer && (
                          <p className="text-sm text-gray-500 mt-1">
                            Minimum: {formatCurrency(selectedPlayer.base_price)}
                          </p>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={handleAssignPlayer}
                      disabled={isProcessing || !selectedPlayer || !selectedTeam || !finalPrice}
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
                      <p className="text-gray-900 font-medium">Recycling unsold players...</p>
                      <p className="text-gray-500 text-sm">
                        Making {unsoldPlayers.length} unsold players available for auction again
                      </p>
                    </div>
                  ) : availablePlayers.length > 0 ? (
                    <div className="space-y-4">
                      <p className="text-gray-500">Click "Shuffle" to show the next player</p>
                      <Button
                        onClick={handleShuffle}
                        disabled={isProcessing}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold btn-scale px-8 py-3 text-lg"
                      >
                        {isShuffling ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Shuffling...
                          </>
                        ) : (
                          <>
                            <Shuffle className="h-5 w-5 mr-2" />
                            Shuffle Next Player
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <p className="text-gray-500">No players available for auction</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 font-semibold">Recent Sales</CardTitle>
              <CardDescription className="text-gray-500">Latest player assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {(assignments.length > 0 ? assignments : initialData.assignments)
                  .slice(0, 10)
                  .map((assignment: any, index: number) => (
                  <div
                    key={`assignment-${assignment.id}-${index}`}
                    className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg fade-in`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <div>
                        <p className="text-gray-900 font-medium text-sm">
                          {assignment.player?.name || 'Unknown Player'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {assignment.player?.position || 'Unknown Position'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        {assignment.team?.name || 'Unknown Team'}
                      </Badge>
                      <p className="text-xs text-gray-900 font-semibold mt-1">
                        {formatCurrency(assignment.final_price || 0)}
                      </p>
                    </div>
                  </div>
                ))}
                {assignments.length === 0 && initialData.assignments.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No recent sales yet
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
            <p className="text-2xl font-bold text-gray-900 mt-2">{availablePlayers.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              <span className="text-gray-900 font-medium">Total Remaining Budget</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {formatCurrency(teams.reduce((sum, team) => sum + team.budget, 0))}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-gray-900 font-medium">Players Sold</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">{assignments.length}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}