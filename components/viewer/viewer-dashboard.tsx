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
  Star, // for sponsors icon
  Copyright,
  Grid3x3
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
    currentPlayer?: {
      id: number
      name: string
      image?: string
      position?: string
      achievement?: string
      base_price?: number
    } | null
  }
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)

function GroupsTab({ teams }: { teams: any[] }) {
  // Configuration: Add team IDs to each group
  const groupAIds = [11, 5, 3, 4, 2, 10] // Replace with actual team IDs for Group A
  const groupBIds = [1, 8, 9, 6, 7, 12] // Replace with actual team IDs for Group B
  
  // Filter teams by their IDs
  const groupA = teams.filter(team => groupAIds.includes(team.id))
  const groupB = teams.filter(team => groupBIds.includes(team.id))

  const GroupTable = ({ title, teams }: { title: string; teams: any[] }) => (
    <Card className="shadow-sm  border-2 border-amber-500">
      <CardContent className="p-4" >
        <h3 className="text-base font-bold text-gray-900 mb-3">{title}</h3>
        <div className="space-y-2">
          {teams.map((team, idx) => (
            <div
              key={team.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-500 w-6 flex-shrink-0">
                  {idx + 1}
                </span>
                {team.team_logo && (
                  <img
                    src={team.team_logo}
                    alt={team.name}
                    className="h-8 w-8 object-contain flex-shrink-0"
                  />
                )}
                <span className="text-sm font-medium text-gray-900 truncate border border-amber-500 px-2 py-1 rounded-md">
                  {team.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-4">
      <GroupTable title="Group A" teams={groupA} />
      <GroupTable title="Group B" teams={groupB} />
    </div>
  )
}

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
    { key: "groups", label: "Groups", Icon: Grid3x3 },
    { key: "sales", label: "Sales", Icon: ShoppingBag },
    { key: "sponsors", label: "Sponsors", Icon: Star }, // ⭐ New Tab
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-gradient-to-r from-amber-100 via-white to-amber-50 shadow-sm">
  <div className="px-4 py-3">
    <div className="flex flex-col">
      {/* Top row: Logo + ConnectionStatus + Logout */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img
            src="/logos/logo.png"
            alt="Auction Logo"
            className="h-8 w-auto object-contain md:h-10"
          />
        </div>

        <div className="flex items-center space-x-3">
          <ConnectionStatus isConnected={isConnected} lastUpdate={lastUpdate} />

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

      {/* Bottom row: Tournament Name */}
      <h1 className="mt-2 text-center text-base font-bold text-gray-900 sm:text-lg md:text-xl lg:text-2xl">
        CMSC Allumni Memorial Cup 2025
      </h1>
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
      <div className="flex-1 px-4 pb-32"> {/* Increased bottom padding for footer space */}
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

          <TabsContent value="groups" className="space-y-4">
            <GroupsTab teams={data.teams} />
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
              <Card className="flex items-center justify-center p-4 shadow-sm">
                <img src="/logos/mukh.png" alt="Sponsor 6" className="h-12 w-auto object-contain" />
              </Card>
              <Card className="flex items-center justify-center p-4 shadow-sm">
                <img src="/logos/sarjif.jpg" alt="Sponsor 6" className="h-12 w-auto object-contain" />
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="mt-auto bg-gradient-to-r from-amber-100 via-white to-amber-50 border-t border-gray-200 px-4 py-6 pb-20 sm:pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center space-y-3">
            {/* Copyright Info */}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Copyright className="h-4 w-4" />
              <span>{new Date().getFullYear()} Cmsc Allumni. All rights reserved.</span>
            </div>
            
            {/* Developer Credit */}
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>Developed by</span>
              <span className="font-medium text-amber-600">Saad Rizwan Aibani</span>
            </div>
            
            {/* Decorative Divider */}
            <div className="flex items-center space-x-2">
              <div className="h-0.5 w-8 bg-gradient-to-r from-transparent via-amber-300 to-transparent rounded-full"></div>
              <div className="h-0.5 w-8 bg-gradient-to-r from-transparent via-amber-300 to-transparent rounded-full"></div>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Bottom Navigation - Fixed for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 px-2 pb-2 sm:bottom-4 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 sm:px-0 sm:pb-0">
        <div className="flex items-center justify-center w-full sm:w-auto">
          <div className="flex items-center justify-between bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-1 w-full max-w-sm sm:max-w-none">
            {tabs.map(({ key, label, Icon }) => (
              <button
                key={key}
                aria-label={`${label} tab`}
                onClick={() => setActiveTab(key)}
                className={`flex flex-col items-center justify-center min-w-0 flex-1 sm:flex-none text-xs px-2 py-2 sm:px-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-0 ${
                  activeTab === key 
                    ? "bg-blue-100 text-blue-600 shadow-sm" 
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon
                  className={`h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1 transition-colors duration-300 ${
                    activeTab === key ? "text-blue-600" : "text-gray-400"
                  }`}
                />
                <span className="truncate text-[10px] sm:text-xs leading-tight">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  )
}