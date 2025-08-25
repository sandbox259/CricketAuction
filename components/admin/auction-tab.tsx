"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Gavel, DollarSign, Users, Clock, ArrowRight, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

interface AuctionTabProps {
  initialData: {
    teams: any[]
    players: any[]
    assignments: any[]
  }
}

export default function AuctionTab({ initialData }: AuctionTabProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null)
  const [selectedTeam, setSelectedTeam] = useState("")
  const [finalPrice, setFinalPrice] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)
  const [isMarkingUnsold, setIsMarkingUnsold] = useState(false)
  const [hasRecycledUnsold, setHasRecycledUnsold] = useState(false)
  const [playersData, setPlayersData] = useState(initialData.players)
  const [isRecycling, setIsRecycling] = useState(false)

  const availablePlayers = playersData.filter((p) => p.status === "available")
  const unsoldPlayers = playersData.filter((p) => p.status === "unsold")
  const currentPlayer = availablePlayers[0] // For demo, show first available player

  useEffect(() => {
    const recycleUnsoldPlayers = async () => {
      if (availablePlayers.length === 0 && unsoldPlayers.length > 0 && !hasRecycledUnsold) {
        console.log("[v0] No available players, recycling unsold players...")
        setIsRecycling(true)
        try {
          const { error } = await supabase.from("players").update({ status: "available" }).eq("status", "unsold")

          if (error) throw error

          const { data: updatedPlayers, error: fetchError } = await supabase.from("players").select("*").order("name")

          if (fetchError) throw fetchError

          setPlayersData(updatedPlayers || [])
          setHasRecycledUnsold(true)
          console.log("[v0] Successfully recycled unsold players")
        } catch (error: any) {
          console.log("[v0] Error recycling unsold players:", error.message)
        } finally {
          setIsRecycling(false)
        }
      }
    }

    recycleUnsoldPlayers()
  }, [availablePlayers.length, unsoldPlayers.length, hasRecycledUnsold])

  const handleAssignPlayer = async () => {
    if (!selectedPlayer || !selectedTeam || !finalPrice) {
      console.log("Please select player, team, and enter final price")
      return
    }

    setIsAssigning(true)
    setIsProcessing(true)
    try {
      const { data, error } = await supabase.rpc("assign_player_to_team", {
        p_player_id: selectedPlayer.id,
        p_team_id: Number.parseInt(selectedTeam),
        p_final_price: Number.parseFloat(finalPrice),
      })

      if (error) throw error

      if (data.success) {
        console.log("Player assigned successfully!")
        setPlayersData((prev) => prev.map((p) => (p.id === selectedPlayer.id ? { ...p, status: "sold" } : p)))
        setSelectedPlayer(null)
        setSelectedTeam("")
        setFinalPrice("")
      } else {
        console.log(data.error || "Failed to assign player")
      }
    } catch (error: any) {
      console.log(error.message || "An error occurred")
    } finally {
      setIsAssigning(false)
      setIsProcessing(false)
    }
  }

  const handleMarkUnsold = async (playerId: number) => {
    setIsMarkingUnsold(true)
    setIsProcessing(true)
    try {
      const { data, error } = await supabase.rpc("mark_player_unsold", {
        p_player_id: playerId,
      })

      if (error) throw error

      if (data.success) {
        console.log("Player marked as unsold")
        setPlayersData((prev) => prev.map((p) => (p.id === playerId ? { ...p, status: "unsold" } : p)))
      } else {
        console.log(data.error || "Failed to mark player as unsold")
      }
    } catch (error: any) {
      console.log(error.message || "An error occurred")
    } finally {
      setIsMarkingUnsold(false)
      setIsProcessing(false)
    }
  }

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
                        <div className="flex items-start space-x-6 mb-6">
                          <div className="flex-shrink-0">
                            <img
                              src={
                                currentPlayer.image ||
                                `/placeholder.svg?height=120&width=120&query=cricket player ${currentPlayer.name || "/placeholder.svg"}`
                              }
                              alt={currentPlayer.name}
                              className="w-24 h-24 rounded-xl object-cover border-2 border-gray-200"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="text-2xl font-bold text-gray-900">{currentPlayer.name}</h4>
                                <p className="text-gray-500 font-medium">{currentPlayer.position}</p>
                              </div>
                              <Badge className="bg-amber-500 text-white px-3 py-1 rounded-full font-medium">
                                Base: ₹{currentPlayer.base_price}
                              </Badge>
                            </div>
                            {currentPlayer.achievement && (
                              <div className="mt-3">
                                <Badge
                                  variant="outline"
                                  className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1 rounded-full"
                                >
                                  🏆 {currentPlayer.achievement}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-3">
                          <Button
                            onClick={() => setSelectedPlayer(currentPlayer)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold btn-scale"
                            disabled={isProcessing}
                          >
                            <ArrowRight className="h-4 w-4 mr-2" />
                            Next Player
                          </Button>
                          <Button
                            onClick={() => handleMarkUnsold(currentPlayer.id)}
                            variant="outline"
                            className="border-red-500 text-red-500 hover:bg-red-500 font-semibold btn-scale"
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-900 font-medium">Selected Player</Label>
                        <Select
                          value={selectedPlayer?.id?.toString() || ""}
                          onValueChange={(value) => {
                            const player = availablePlayers.find((p) => p.id.toString() === value)
                            setSelectedPlayer(player)
                          }}
                        >
                          <SelectTrigger className="bg-white border-gray-200 text-gray-900">
                            <SelectValue placeholder="Select a player" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border border-gray-200 text-gray-900">
                            {availablePlayers.map((player) => (
                              <SelectItem
                                key={player.id}
                                value={player.id.toString()}
                                className="text-gray-900 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-900"
                              >
                                {player.name} ({player.position})
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
                            {initialData.teams.map((team) => (
                              <SelectItem
                                key={team.id}
                                value={team.id.toString()}
                                className="text-gray-900 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-900"
                              >
                                {team.name} (₹{team.budget} remaining)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-gray-900 font-medium">Final Price (₹)</Label>
                      <Input
                        type="number"
                        placeholder="Enter final price"
                        value={finalPrice}
                        onChange={(e) => setFinalPrice(e.target.value)}
                        className="bg-white border-gray-200 text-gray-900"
                      />
                    </div>

                    <Button
                      onClick={handleAssignPlayer}
                      disabled={isProcessing || !selectedPlayer || !selectedTeam || !finalPrice}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold btn-scale"
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
                  {isRecycling || (unsoldPlayers.length > 0 && !hasRecycledUnsold) ? (
                    <div className="space-y-3">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-amber-500" />
                      <p className="text-gray-900 font-medium">Recycling unsold players...</p>
                      <p className="text-gray-500 text-sm">
                        Making {unsoldPlayers.length} unsold players available for auction again
                      </p>
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
                {initialData.assignments.slice(0, 10).map((assignment: any, index: number) => (
                  <div
                    key={assignment.id}
                    className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg fade-in`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <div>
                        <p className="text-gray-900 font-medium text-sm">{assignment.player?.name}</p>
                        <p className="text-xs text-gray-500">{assignment.player?.position}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        {assignment.team?.name}
                      </Badge>
                      <p className="text-xs text-gray-900 font-semibold mt-1">
                        ₹{assignment.final_price}
                      </p>
                    </div>
                  </div>
                ))}
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
              ₹{initialData.teams.reduce((sum, team) => sum + team.budget, 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-gray-900 font-medium">Players Sold</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">{initialData.assignments.length}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
