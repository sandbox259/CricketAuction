"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import {
  LogOut,
  Trophy,
  Users,
  DollarSign,
  PlayCircle,
  Users2,
  ShoppingBag,
  Star // for sponsors icon
} from "lucide-react"
import { signOut } from "@/lib/actions"
import { useRealtimeAuction } from "@/hooks/use-realtime-auction"
import { ConnectionStatus } from "@/components/ui/connection-status"
import LiveAuctionTab from "./live-auction-tab"
import PlayersListTab from "./players-list-tab"
import TeamsStandingsTab from "./teams-standings-tab"
import RecentSalesTab from "./recent-sales-tab"

interface ViewerDashboardProps {
  user?: any
  initialData: {
    teams: any[]
    players: any[]
    assignments: any[]
    auctionOverview: any
  }
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)

export default function ViewerDashboard({ user, initialData }: ViewerDashboardProps) {
  const [activeTab, setActiveTab] = useState("live")

  const { data, isConnected, lastUpdate } = useRealtimeAuction(initialData)
  const { auctionOverview } = data

  const availablePlayers = data.players.filter((p) => p.status === "available")
  const currentPlayer = data.currentPlayer || null

  const tabs = [
    { key: "live", label: "Live", Icon: PlayCircle },
    { key: "players", label: "Players", Icon: Users2 },
    { key: "teams", label: "Teams", Icon: Trophy },
    { key: "sales", label: "Sales", Icon: ShoppingBag },
    { key: "sponsors", label: "Sponsors", Icon: Star }, // ⭐ New Tab
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-gradient-to-r from-amber-100 via-white to-amber-50 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Trophy Icon */}
              {/* Logo Placeholder */}
              <img
                src="/logos/logo.png"
                alt="Auction Logo"
                className="h-8 w-auto object-contain"
              />
              <div>
                <h1 className="text-lg font-bold text-gray-900">Cricket Auction</h1>
                <ConnectionStatus isConnected={isConnected} lastUpdate={lastUpdate} />
              </div>
            </div>
            {user && (
              <form action={signOut}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </form>
            )}
          </div>
        </div>
      </header>

      {/* Live Status Banner */}
      {currentPlayer && (
        <div className="border-b bg-white shadow-sm px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full animate-pulse">
                LIVE
              </span>
              <span className="text-sm font-medium text-gray-900">Player on Auction</span>
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
          <Card className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 shadow-sm">
            <CardContent className="p-3 flex items-center space-x-3">
              <div className="p-2 rounded-full bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Players Sold</p>
                <p className="text-lg font-bold text-gray-900">{auctionOverview.sold_players || 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 shadow-sm">
            <CardContent className="p-3 flex items-center space-x-3">
              <div className="p-2 rounded-full bg-emerald-100">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Spent</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(auctionOverview.total_spent || 0)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 pb-20">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsContent value="live" className="space-y-4">
            <LiveAuctionTab currentPlayer={currentPlayer} data={data} />
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

          {/* Sponsors Section */}
          <TabsContent value="sponsors" className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Our Sponsors</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {/* Replace src with actual sponsor logos */}
              <Card className="flex items-center justify-center p-4 shadow-sm">
                <img src="/logos/aashiyanalogo.jpg" alt="Sponsor 1" className="h-12 w-auto object-contain" />
              </Card>
              <Card className="flex items-center justify-center p-4 shadow-sm">
                <img src="/logos/designer.jpg" alt="Sponsor 2" className="h-12 w-auto object-contain" />
              </Card>
              <Card className="flex items-center justify-center p-4 shadow-sm">
                <img src="/logos/Humalogo.jpg" alt="Sponsor 3" className="h-12 w-auto object-contain" />
              </Card>
              <Card className="flex items-center justify-center p-4 shadow-sm">
                <img src="/logos/mithiyaaj.jpg" alt="Sponsor 4" className="h-12 w-auto object-contain" />
              </Card>
              <Card className="flex items-center justify-center p-4 shadow-sm">
                <img src="/logos/shahilogo.jpg" alt="Sponsor 5" className="h-12 w-auto object-contain" />
              </Card>
              <Card className="flex items-center justify-center p-4 shadow-sm">
                <img src="/logos/sigdi.jpg" alt="Sponsor 6" className="h-12 w-auto object-contain" />
              </Card>

            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Bottom Navigation */}
      <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex items-center justify-between w-full max-w-md mx-auto bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200 px-6 py-2 space-x-6">
          {tabs.map(({ key, label, Icon }) => (
            <button
              key={key}
              aria-label={`${label} tab`}
              onClick={() => setActiveTab(key)}
              className={`flex flex-col items-center text-xs px-3 py-2 rounded-xl transition-colors duration-300 focus:outline-none focus:ring-0 ${
                activeTab === key ? "bg-blue-50 text-blue-600" : "text-gray-500"
              }`}
            >
              <Icon
                className={`h-5 w-5 mb-1 transition-colors duration-300 ${
                  activeTab === key ? "text-blue-600" : "text-gray-400"
                }`}
              />
              {label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
