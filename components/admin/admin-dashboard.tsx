"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { LogOut, Users, Trophy, DollarSign, Activity } from "lucide-react"
import { signOut } from "@/lib/actions"
import { useRealtimeAuction } from "@/hooks/use-realtime-auction"
import { ConnectionStatus } from "@/components/ui/connection-status"
import PlayersTab from "./players-tab"
import TeamsTab from "./teams-tab"
import AuctionTab from "./auction-tab"
import UsersTab from "./users-tab"
import AuditTab from "./audit-tab"

interface AdminDashboardProps {
  user: any
  initialData: {
    teams: any[]
    players: any[]
    assignments: any[]
    users: any[]
    auctionOverview: any
  }
}




export default function AdminDashboard({ user, initialData }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const { data, isConnected, lastUpdate } = useRealtimeAuction(initialData)
  const { auctionOverview } = data

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Trophy className="h-8 w-8 text-amber-500" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Cricket Auction Admin</h1>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-500">Welcome, {user.phone}</p>
                  <ConnectionStatus isConnected={isConnected} lastUpdate={lastUpdate} />
                </div>
              </div>
            </div>
            <form action={signOut}>
              <Button variant="ghost" size="sm" className="text-gray-700 hover:bg-blue-700 btn-scale">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white border border-gray-200 shadow-sm">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="auction" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Auction
            </TabsTrigger>
            <TabsTrigger value="players" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Players
            </TabsTrigger>
            <TabsTrigger value="teams" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Teams
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Users
            </TabsTrigger>
            <TabsTrigger value="audit" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Audit
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-900">Total Players</CardTitle>
                  <Users className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{auctionOverview.total_players || 0}</div>
                  <div className="flex space-x-4 mt-2">
                    <Badge className="status-sold rounded-full px-2 py-1 text-xs font-medium">
                      Sold: {auctionOverview.sold_players || 0}
                    </Badge>
                    <Badge className="status-unsold rounded-full px-2 py-1 text-xs font-medium">
                      Unsold: {auctionOverview.unsold_players || 0}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-900">Total Teams</CardTitle>
                  <Trophy className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{auctionOverview.total_teams || 0}</div>
                  <p className="text-xs text-gray-500 mt-2">Active franchises</p>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-900">Total Budget</CardTitle>
                  <DollarSign className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    ₹{(auctionOverview.total_budget || 0)}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Remaining budget</p>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-900">Total Spent</CardTitle>
                  <Activity className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    ₹{(auctionOverview.total_spent || 0)}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">In player purchases</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900 font-semibold">Recent Activity</CardTitle>
                <CardDescription className="text-gray-500">Latest player assignments and transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.assignments.slice(0, 5).map((assignment: any, index: number) => (
                    <div
                      key={assignment.id}
                      className={`flex items-center justify-between p-4 bg-gray-50 rounded-lg fade-in`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <div>
                          <p className="text-gray-900 font-medium">{assignment.player?.name}</p>
                          <p className="text-sm text-gray-500">Assigned to {assignment.team?.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-900 font-semibold">
                          ₹{assignment.final_price}
                        </p>
                        <p className="text-xs text-gray-500">{new Date(assignment.assigned_at).toLocaleDateString("en-GB")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="auction">
            <AuctionTab initialData={data} />
          </TabsContent>

          <TabsContent value="players">
            <PlayersTab initialPlayers={data.players} />
          </TabsContent>

          <TabsContent value="teams">
            <TeamsTab initialTeams={data.teams} />
          </TabsContent>

          <TabsContent value="users">
            <UsersTab initialUsers={initialData.users} teams={data.teams} />
          </TabsContent>

          <TabsContent value="audit">
            <AuditTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
