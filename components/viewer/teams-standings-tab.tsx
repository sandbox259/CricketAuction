"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Trophy, Users, DollarSign, TrendingUp, Search, ChevronDown, ChevronUp } from "lucide-react"
import { useRealtimeTeams } from "@/hooks/use-realtime-teams"
import { useState } from "react"

interface TeamsStandingsTabProps {
  teams: any[]
}

export default function TeamsStandingsTab({ teams }: TeamsStandingsTabProps) {
  const { teamSummaries, loading } = useRealtimeTeams(teams)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTeam, setSelectedTeam] = useState<string>("all")
  const [expandedTeams, setExpandedTeams] = useState<Set<number>>(new Set())

  const totalBudget = 900000 // 9 Lakhs

  const filteredTeams = teamSummaries.filter((team) => {
    const matchesSearch = team.team_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTeamFilter = selectedTeam === "all" || team.team_id.toString() === selectedTeam
    return matchesSearch && matchesTeamFilter
  })

  const sortedTeams = filteredTeams.sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0))

  const toggleExpandedPlayers = (teamId: number) => {
    const newExpanded = new Set(expandedTeams)
    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId)
    } else {
      newExpanded.add(teamId)
    }
    setExpandedTeams(newExpanded)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-white">Loading team data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-gray-200"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedTeam === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTeam("all")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                All Teams
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Teams Leaderboard */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-gray-900 text-lg flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-orange-400" />
            Team Standings
          </CardTitle>
          <CardDescription className="text-gray-400 text-sm">Ranked by total spending</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedTeams.map((team, index) => (
              <div key={team.team_id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <div className="flex-shrink-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0
                        ? "bg-yellow-600 text-white"
                        : index === 1
                          ? "bg-gray-400 text-white"
                          : index === 2
                            ? "bg-orange-600 text-white"
                            : "bg-gray-600 text-white"
                    }`}
                  >
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 font-medium text-sm truncate">{team.team_name}</p>
                  <p className="text-gray-400 text-xs">{team.players_count || 0} players</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-900 font-medium text-sm">
                    ₹{(team.total_spent || 0)}
                  </p>
                  <p className="text-gray-400 text-xs">spent</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Individual Team Cards */}
      <div className="space-y-3">
        {sortedTeams.map((team) => (
          <Card key={team.team_id} className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={team.team_logo || "/placeholder.svg?height=60&width=40&query=cricket team logo"}
                    alt={`${team.team_name} logo`}
                    className="w-10 h-16 sm:w-12 sm:h-18 md:w-14 md:h-20 object-cover rounded border-2 border-amber-500"
                  />
                  <CardTitle className="text-gray-900 text-base">{team.team_name}</CardTitle>
                </div>
                <Badge variant="outline" className="text-xs">
                  {team.players_count || 0} players
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Budget Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Budget Used</span>
                  <span className="text-gray-900">₹{(team.total_spent || 0)} / ₹9L</span>
                </div>
                <Progress value={((team.total_spent || 0) / totalBudget) * 100} className="h-2" />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-2 bg-white/5 rounded-lg">
                  <DollarSign className="h-4 w-4 text-green-400 mx-auto mb-1" />
                  <p className="text-gray-900 font-medium text-sm">₹{team.budget}</p>
                  <p className="text-gray-400 text-xs">Remaining</p>
                </div>
                <div className="text-center p-2 bg-white/5 rounded-lg">
                  <Users className="h-4 w-4 text-blue-400 mx-auto mb-1" />
                  <p className="text-gray-900 font-medium text-sm">{team.players_count || 0}</p>
                  <p className="text-gray-400 text-xs">Squad Size</p>
                </div>
                <div className="text-center p-2 bg-white/5 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-purple-400 mx-auto mb-1" />
                  <p className="text-gray-900 font-medium text-sm">
                    {(((team.total_spent || 0) / totalBudget) * 100).toFixed(0)}%
                  </p>
                  <p className="text-gray-400 text-xs">Used</p>
                </div>
              </div>

              {/* Team Leadership */}
              <div>
                <p className="text-gray-400 text-sm mb-3">Team Leadership</p>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {/* Owner */}
                  <div className="text-center">
                    <img
                      src={team.owner_image || "/placeholder.svg?height=60&width=60&query=team owner portrait"}
                      alt={team.owner_name || "Team Owner"}
                      className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 mx-auto mb-1"
                    />
                    <p className="text-gray-900 text-xs font-medium">{team.owner_name || "Owner"}</p>
                    <p className="text-gray-400 text-xs">Owner</p>
                  </div>

                  {/* Captain */}
                  <div className="text-center">
                    <img
                      src={team.captain_image || "/placeholder.svg?height=60&width=60&query=cricket captain portrait"}
                      alt={team.captain_name || "Team Captain"}
                      className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 mx-auto mb-1"
                    />
                    <p className="text-gray-900 text-xs font-medium">{team.captain_name || "Captain"}</p>
                    <p className="text-gray-400 text-xs">Captain</p>
                  </div>

                  {/* Vice Captain */}
                  <div className="text-center">
                    <img
                      src={
                        team.vice_captain_image ||
                        "/placeholder.svg?height=60&width=60&query=cricket vice captain portrait" ||
                        "/placeholder.svg"
                      }
                      alt={team.vice_captain_name || "Vice Captain"}
                      className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 mx-auto mb-1"
                    />
                    <p className="text-gray-900 text-xs font-medium">{team.vice_captain_name || "Vice Captain"}</p>
                    <p className="text-gray-400 text-xs">Vice Captain</p>
                  </div>
                </div>
              </div>

              {/* Recent Acquisitions */}
              {team.players && team.players.length > 0 && (
                <div>
                  <p className="text-gray-400 text-sm mb-2">Recent Acquisitions</p>
                  <div className="space-y-2">
                    {(expandedTeams.has(team.team_id) ? team.players : team.players.slice(0, 3)).map((player: any) => (
                      <div key={player.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <img
                            src={player.image || "/placeholder.svg?height=32&width=32&query=cricket player portrait"}
                            alt={player.name}
                            className="w-8 h-8 rounded-full object-cover border border-gray-200"
                          />
                          <div>
                            <p className="text-gray-900">{player.name}</p>
                            <p className="text-gray-400 text-xs">{player.position}</p>
                          </div>
                        </div>
                        <p className="text-orange-400 font-medium">₹{player.final_price}</p>
                      </div>
                    ))}
                    {team.players.length > 3 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpandedPlayers(team.team_id)}
                        className="w-full text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                      >
                        {expandedTeams.has(team.team_id) ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-1" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-1" />+{team.players.length - 3} more players
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
