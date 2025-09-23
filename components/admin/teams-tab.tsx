"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trophy, Users, DollarSign } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

interface TeamsTabProps {
  initialTeams: any[]
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)

export default function TeamsTab({ initialTeams }: TeamsTabProps) {
  const [teams, setTeams] = useState(initialTeams)
  const [teamSummaries, setTeamSummaries] = useState<any[]>([])

  useEffect(() => {
    const fetchTeamSummaries = async () => {
      const summaries = await Promise.all(
        teams.map(async (team) => {
          const { data } = await supabase.rpc("get_team_summary", {
            p_team_id: team.id,
          })
          return data
        }),
      )
      setTeamSummaries(summaries.filter(Boolean))
    }

    fetchTeamSummaries()
  }, [teams])

  const totalBudget = 900000 // 9 Lakhs

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Teams Overview</h2>
        <p className="text-gray-600">Monitor team budgets and player acquisitions</p>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamSummaries.map((summary) => (
          <Card key={summary.team_id} className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between w-full">
                {/* Logo + Team Name */}
                <div className="flex items-center space-x-3">
                  {summary.team_logo && (
                    <img
                      src={summary.team_logo || "/placeholder.svg?height=40&width=40&query=team logo"}
                      alt={`${summary.team_name} logo`}
                      className="w-20 h-30 object-contain rounded-md border border-blue-500"
                    />
                  )}
                  <CardTitle className="text-gray-900 text-lg">{summary.team_name}</CardTitle>
                </div>

                {/* Player Count Badge on the Right */}
                <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">
                  {(summary.players_count || 0)} players
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {summary.owner_name && (
                <div className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <img
                    src={summary.owner_image || "/placeholder.svg?height=40&width=40&query=team owner"}
                    alt={summary.owner_name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-amber-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{summary.owner_name}</p>
                    <p className="text-xs text-gray-600">Team Owner</p>
                  </div>
                </div>
              )}

              {/* Budget Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Budget Used</span>
                  <span className="text-gray-900 font-medium">
                    {formatCurrency(summary.total_spent || 0)} / ₹9L
                  </span>
                </div>
                <Progress value={((summary.total_spent || 0) / totalBudget) * 100} className="h-2" />
              </div>

              {/* Remaining Budget */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm text-gray-600">Remaining</span>
                </div>
                <span className="text-gray-900 font-medium">{formatCurrency(summary.budget)}</span>
              </div>

              {/* Players Count */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-600">Squad Size</span>
                </div>
                <span className="text-gray-900 font-medium">{summary.players_count || 0}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Team Table */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Team Details</CardTitle>
          <CardDescription className="text-gray-600">
            Comprehensive view of all teams and their statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200">
                <TableHead className="text-gray-700">Team</TableHead>
                <TableHead className="text-gray-700">Players</TableHead>
                <TableHead className="text-gray-700">Total Spent</TableHead>
                <TableHead className="text-gray-700">Remaining Budget</TableHead>
                <TableHead className="text-gray-700">Budget Used %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamSummaries.map((summary) => (
                <TableRow key={summary.team_id} className="border-gray-200 hover:bg-gray-50">
                  <TableCell className="text-gray-900 font-medium">{summary.team_name}</TableCell>
                  <TableCell className="text-gray-600">{summary.players_count || 0}</TableCell>
                  <TableCell className="text-gray-600">
                    {formatCurrency(summary.total_spent || 0)}
                  </TableCell>
                  <TableCell className="text-gray-600">{formatCurrency(summary.budget)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Progress
                        value={((summary.total_spent || 0) / totalBudget) * 100}
                        className="w-16 h-2"
                      />
                      <span className="text-gray-600 text-sm">
                        {(((summary.total_spent || 0) / totalBudget) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Team Players Details */}
      {teamSummaries.map(
        (summary) =>
          summary.players &&
          summary.players.length > 0 && (
            <Card key={`players-${summary.team_id}`} className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900">{summary.team_name} Squad</CardTitle>
                <CardDescription className="text-gray-600">
                  Players acquired by {summary.team_name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {summary.players.map((player: any) => (
                    <div key={player.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-gray-900 font-medium">{player.name}</h4>
                        <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">
                          {player.position}
                        </Badge>
                      </div>
                      <p className="text-amber-500 font-medium">{formatCurrency(player.final_price)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ),
      )}
    </div>
  )
}
