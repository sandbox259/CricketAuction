"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Gavel, Clock, TrendingUp, Users, Trophy } from "lucide-react"

interface LiveAuctionTabProps {
  currentPlayer: any
  initialData: {
    teams: any[]
    players: any[]
    assignments: any[]
    auctionOverview: any
  }
}

export default function LiveAuctionTab({ currentPlayer, initialData }: LiveAuctionTabProps) {
  const [timeElapsed, setTimeElapsed] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const availablePlayers = initialData.players.filter((p) => p.status === "available")
  const auctionProgress =
    ((initialData.auctionOverview.sold_players + initialData.auctionOverview.unsold_players) /
      initialData.auctionOverview.total_players) *
    100

  return (
    <div className="space-y-4">
      {/* Current Player Card */}
      {currentPlayer ? (
        <Card className="bg-white border-gray-200 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Gavel className="h-5 w-5 text-blue-600" />
                <span className="text-gray-900 font-medium">Current Player</span>
              </div>
              <Badge className="bg-red-600 text-white animate-pulse">LIVE</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <div className="flex-shrink-0">
                <img
                  src={
                    currentPlayer.image ||
                    `/placeholder.svg?height=120&width=160&query=cricket player ${currentPlayer.name || "/placeholder.svg"}`
                  }
                  alt={currentPlayer.name}
                  className="w-20 h-20 md:w-40 md:h-32 rounded-full md:rounded-lg object-cover border-2 border-blue-600"
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{currentPlayer.name}</h2>
                <p className="text-amber-500 text-lg font-medium mb-2">{currentPlayer.position}</p>
                {currentPlayer.achievement && (
                  <Badge className="bg-amber-100 text-amber-800 border border-amber-300">
                    <Trophy className="h-3 w-3 mr-1" />
                    {currentPlayer.achievement}
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Base Price</p>
                <p className="text-gray-900 font-bold">₹{currentPlayer.base_price}</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Time Elapsed</p>
                <p className="text-gray-900 font-bold">{formatTime(timeElapsed)}</p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-gray-600 text-sm">Bidding in progress...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-6 text-center">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-gray-900 font-medium mb-2">No Active Auction</h3>
            <p className="text-gray-600 text-sm">Waiting for next player...</p>
          </CardContent>
        </Card>
      )}

      {/* Auction Progress */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-gray-900 text-lg flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-amber-500" />
            Auction Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Players Completed</span>
              <span className="text-gray-900 font-medium">
                {(initialData.auctionOverview.sold_players || 0) + (initialData.auctionOverview.unsold_players || 0)} /{" "}
                {initialData.auctionOverview.total_players || 0}
              </span>
            </div>
            <Progress value={auctionProgress} className="h-2" />
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200">
              <p className="text-emerald-600 font-bold text-lg">{initialData.auctionOverview.sold_players || 0}</p>
              <p className="text-xs text-gray-600">Sold</p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg border border-red-200">
              <p className="text-red-600 font-bold text-lg">{initialData.auctionOverview.unsold_players || 0}</p>
              <p className="text-xs text-gray-600">Unsold</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-600 font-bold text-lg">{availablePlayers.length}</p>
              <p className="text-xs text-gray-600">Remaining</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Players */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-gray-900 text-lg flex items-center">
            <Users className="h-5 w-5 mr-2 text-amber-500" />
            Coming Up Next
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {availablePlayers.slice(1, 4).map((player, index) => (
              <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{index + 2}</span>
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium text-sm">{player.name}</p>
                    <p className="text-gray-600 text-xs">{player.position}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-900 text-sm font-medium">₹{player.base_price}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-gray-900 text-lg">Recent Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {initialData.assignments.slice(0, 3).map((assignment: any) => (
              <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg fade-in">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <div>
                    <p className="text-gray-900 font-medium text-sm">{assignment.player?.name}</p>
                    <p className="text-gray-600 text-xs">{assignment.team?.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-900 font-medium text-sm">₹{assignment.final_price}</p>
                  <p className="text-gray-600 text-xs">{new Date(assignment.assigned_at).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
