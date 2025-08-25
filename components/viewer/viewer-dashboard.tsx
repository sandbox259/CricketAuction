"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, Trophy, Users, DollarSign } from "lucide-react"
import { signOut } from "@/lib/actions"
import { useRealtimeAuction } from "@/hooks/use-realtime-auction"
import { ConnectionStatus } from "@/components/ui/connection-status"
import LiveAuctionTab from "./live-auction-tab"
import PlayersListTab from "./players-list-tab"
import TeamsStandingsTab from "./teams-standings-tab"
import RecentSalesTab from "./recent-sales-tab"

interface ViewerDashboardProps {
  user?: any // Made user optional since viewers don't need authentication
  initialData: {
    teams: any[]
    players: any[]
    assignments: any[]
    auctionOverview: any
  }
}

export default function ViewerDashboard({ user, initialData }: ViewerDashboardProps) {
  const [activeTab, setActiveTab] = useState("live")

  const { data, isConnected, lastUpdate } = useRealtimeAuction(initialData)
  const { auctionOverview } = data

  const availablePlayers = data.players.filter((p) => p.status === "available")
  const currentPlayer = availablePlayers[0] // For demo, show first available player

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 border-b bg-white border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Trophy className="h-6 w-6 text-amber-500" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">Cricket Auction</h1>
                <ConnectionStatus isConnected={isConnected} lastUpdate={lastUpdate} />
              </div>
            </div>
            {user && (
              <form action={signOut}>
                <Button variant="ghost" size="sm" className="p-2 text-gray-900 hover:bg-gray-100">
                  <LogOut className="h-4 w-4" />
                </Button>
              </form>
            )}
          </div>
        </div>
      </header>

      {/* Live Status Banner */}
      {currentPlayer && (
        <div className="border-b bg-amber-50 border-amber-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-900">LIVE</span>
            </div>
            <div className="text-right">
              <p className="font-medium text-sm text-gray-900">{currentPlayer.name}</p>
              <p className="text-xs text-amber-600">{currentPlayer.position}</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-600">Players Sold</p>
                  <p className="text-lg font-bold text-gray-900">{auctionOverview.sold_players || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-emerald-500" />
                <div>
                  <p className="text-xs text-gray-600">Total Spent</p>
                  <p className="text-lg font-bold text-gray-900">
                    ₹{(auctionOverview.total_spent || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-20">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 gap-x-2 h-12 bg-white border border-gray-200 rounded-lg overflow-hidden">
            <TabsTrigger
              value="live"
              className="text-xs text-gray-700 hover:bg-gray-100 hover:text-gray-900 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:hover:bg-blue-700 flex items-center justify-center transition-all duration-200"
            >
              Live
            </TabsTrigger>
            <TabsTrigger
              value="players"
              className="text-xs text-gray-700 hover:bg-gray-100 hover:text-gray-900 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:hover:bg-blue-700 flex items-center justify-center transition-all duration-200"
            >
              Players
            </TabsTrigger>
            <TabsTrigger
              value="teams"
              className="text-xs text-gray-700 hover:bg-gray-100 hover:text-gray-900 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:hover:bg-blue-700 flex items-center justify-center transition-all duration-200"
            >
              Teams
            </TabsTrigger>
            <TabsTrigger
              value="sales"
              className="text-xs text-gray-700 hover:bg-gray-100 hover:text-gray-900 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:hover:bg-blue-700 flex items-center justify-center transition-all duration-200"
            >
              Sales
            </TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="space-y-4">
            <LiveAuctionTab currentPlayer={currentPlayer} initialData={data} />
          </TabsContent>

          <TabsContent value="players" className="space-y-4">
            <PlayersListTab players={data.players} />
          </TabsContent>

          <TabsContent value="teams" className="space-y-4">
            <TeamsStandingsTab teams={data.teams} />
          </TabsContent>

          <TabsContent value="sales" className="space-y-4">
            <RecentSalesTab assignments={data.assignments} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Navigation Space */}
      <div className="h-16"></div>
    </div>
  )
}
