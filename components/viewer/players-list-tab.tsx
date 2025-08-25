"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter } from "lucide-react"

interface PlayersListTabProps {
  players: any[]
}

export default function PlayersListTab({ players }: PlayersListTabProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [positionFilter, setPositionFilter] = useState("all")

  const filteredPlayers = players.filter((player) => {
    const matchesSearch =
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.position.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || player.status === statusFilter
    const matchesPosition = positionFilter === "all" || player.position === positionFilter
    return matchesSearch && matchesStatus && matchesPosition
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sold":
        return <Badge className="bg-green-600 text-xs">Sold</Badge>
      case "unsold":
        return <Badge className="bg-red-600 text-xs">Unsold</Badge>
      default:
        return <Badge className="bg-blue-600 text-xs">Available</Badge>
    }
  }

  const getPositionColor = (position: string) => {
    switch (position) {
      case "Batsman":
        return "text-blue-400"
      case "Bowler":
        return "text-red-400"
      case "All-rounder":
        return "text-green-400"
      case "Wicket-keeper":
        return "text-purple-400"
      default:
        return "text-gray-400"
    }
  }

  const positions = [...new Set(players.map((p) => p.position))]

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-gray-200 text-gray-900 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-white border border-gray-200 text-gray-900 text-sm h-9 rounded-md shadow-sm hover:border-gray-300 focus:ring-1 focus:ring-blue-500 focus:ring-offset-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 text-gray-900">
                <SelectItem
                  value="all"
                  className="text-gray-900 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-900"
                >
                  All Status
                </SelectItem>
                <SelectItem
                  value="available"
                  className="text-gray-900 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-900"
                >
                  Available
                </SelectItem>
                <SelectItem
                  value="sold"
                  className="text-gray-900 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-900"
                >
                  Sold
                </SelectItem>
                <SelectItem
                  value="unsold"
                  className="text-gray-900 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-900"
                >
                  Unsold
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={positionFilter} onValueChange={setPositionFilter}>
              <SelectTrigger className="bg-white border border-gray-200 text-gray-900 text-sm h-9 rounded-md shadow-sm hover:border-gray-300 focus:ring-1 focus:ring-blue-500 focus:ring-offset-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 text-gray-900">
                <SelectItem
                  value="all"
                  className="text-gray-900 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-900"
                >
                  All Positions
                </SelectItem>
                {positions.map((position) => (
                  <SelectItem
                    key={position}
                    value={position}
                    className="text-gray-900 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-900"
                  >
                    {position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Players Count */}
      <div className="flex items-center justify-between px-1">
        <p className="text-gray-400 text-sm">
          {filteredPlayers.length} player{filteredPlayers.length !== 1 ? "s" : ""} found
        </p>
        <Filter className="h-4 w-4 text-gray-400" />
      </div>

      {/* Players List */}
      <div className="space-y-3">
        {filteredPlayers.map((player) => (
          <Card key={player.id} className="bg-white/10 border-gray-200 text-gray-400 text-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-gray-900 font-medium">{player.name}</h3>
                  <p className={`text-sm ${getPositionColor(player.position)}`}>{player.position}</p>
                </div>
                {getStatusBadge(player.status)}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 mb-1">Base Price</p>
                  <p className="text-gray-900 font-medium">₹{player.base_price}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Final Price</p>
                  <p className="text-gray-900 font-medium">
                    {player.current_price > 0 ? `₹${player.current_price}` : "-"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPlayers.length === 0 && (
        <Card className="bg-white/10 border-gray-200 text-gray-400 text-sm">
          <CardContent className="p-6 text-center">
            <p className="text-gray-400">No players found matching your criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
