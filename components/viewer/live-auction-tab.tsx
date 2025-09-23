"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Gavel, Clock, TrendingUp, Users, Trophy, History } from "lucide-react"

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

  const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)

  const availablePlayers = initialData.players.filter((p) => p.status === "available")
  const auctionProgress =
    ((initialData.auctionOverview.sold_players + initialData.auctionOverview.unsold_players) /
      initialData.auctionOverview.total_players) *
    100



  return (
    <div className="space-y-5">
      {/* 🔴 Current Player */}
      {currentPlayer ? (
        <Card className="bg-gradient-to-r from-white via-gray-50 to-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Gavel className="h-5 w-5 text-blue-600" />
                <span className="text-gray-900 font-medium">Current Player</span>
              </div>
              <Badge className="bg-red-500 text-white animate-pulse shadow-sm">LIVE</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="flex-shrink-0">
                <img
                  src={
                    currentPlayer.image ||
                    `/placeholder.svg?height=120&width=160&query=cricket player ${currentPlayer.name || "/placeholder.svg"}`
                  }
                  alt={currentPlayer.name}
                  className="w-24 h-24 md:w-40 md:h-32 rounded-full md:rounded-xl object-cover border-2 border-blue-600 shadow-sm"
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900">{currentPlayer.name}</h2>
                <p className="text-amber-500 text-lg font-medium">{currentPlayer.position}</p>
                {currentPlayer.achievement && (
                  <Badge className="mt-2 bg-amber-100 text-amber-800 border border-amber-300 shadow-sm">
                    <Trophy className="h-3 w-3 mr-1" />
                    {currentPlayer.achievement}
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg shadow-sm">
                <p className="text-xs text-gray-600 mb-1">Base Price</p>
                <p className="text-gray-900 font-bold">{formatCurrency(currentPlayer.base_price)}</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg shadow-sm">
                <p className="text-xs text-gray-600 mb-1">Time Elapsed</p>
                <p className="text-gray-900 font-bold">{formatTime(timeElapsed)}</p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-gray-500 text-sm italic">Bidding in progress...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white border-gray-200 shadow-sm rounded-xl">
          <CardContent className="p-6 text-center space-y-2">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <h3 className="text-gray-900 font-semibold">No Active Auction</h3>
            <p className="text-gray-500 text-sm">Waiting for the next player...</p>
          </CardContent>
        </Card>
      )}

      {/* 📊 Auction Progress */}
      <Card className="bg-white border-gray-200 rounded-xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-gray-900 text-lg flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-amber-500" />
            Auction Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Players Completed</span>
              <span className="text-gray-900 font-semibold">
                {(initialData.auctionOverview.sold_players || 0) +
                  (initialData.auctionOverview.unsold_players || 0)}{" "}
                / {initialData.auctionOverview.total_players || 0}
              </span>
            </div>
            <Progress value={auctionProgress} className="h-2 rounded-full" />
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200 shadow-sm">
              <p className="text-emerald-600 font-bold text-lg">
                {initialData.auctionOverview.sold_players || 0}
              </p>
              <p className="text-xs text-gray-600">Sold</p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg border border-red-200 shadow-sm">
              <p className="text-red-600 font-bold text-lg">
                {initialData.auctionOverview.unsold_players || 0}
              </p>
              <p className="text-xs text-gray-600">Unsold</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg border border-blue-200 shadow-sm">
              <p className="text-blue-600 font-bold text-lg">{availablePlayers.length}</p>
              <p className="text-xs text-gray-600">Remaining</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 🕑 Recent Activity */}
      <Card className="bg-white border-gray-200 rounded-xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-gray-900 text-lg flex items-center">
            <History className="h-5 w-5 mr-2 text-blue-500" />
            Recent Sales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {initialData.assignments.slice(0, 3).map((assignment: any) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <div>
                    <p className="text-gray-900 font-medium text-sm">{assignment.player?.name}</p>
                    <p className="text-gray-600 text-xs">{assignment.team?.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-900 font-semibold text-sm">{formatCurrency(assignment.final_price)}</p>
                  <p className="text-gray-500 text-xs">{assignment.assigned_at? new Date(assignment.assigned_at).toLocaleTimeString("en-US", {hour: "numeric",minute: "2-digit",hour12: true,}).replace("AM", "am").replace("PM", "pm"): "-"}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
