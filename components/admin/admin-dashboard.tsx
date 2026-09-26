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
import RulesTab from "./rules-tab"

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

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)



export default function AdminDashboard({ user, initialData }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const { data, isConnected, lastUpdate } = useRealtimeAuction(initialData)
  const { auctionOverview } = data

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/20">
      <header
  className="
    border-b
    border-amber-200/70
    bg-gradient-to-r
    from-amber-50/80
    via-white
    to-blue-50/40
    shadow-sm
  "
>
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div className="flex min-h-[72px] items-center justify-between gap-4 py-2.5">
      
      {/* Brand */}
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <div
          className="
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-full
            border
            border-amber-200
            bg-white/80
            p-1
            shadow-sm
            sm:h-14
            sm:w-14
            md:h-16
            md:w-16
          "
        >
          <img
            src="https://media.cmscallumni.in/teams/images/cmsclogobg.webp"
            alt="CMSC Logo"
            className="
              h-full
              w-full
              object-contain
            "
          />
        </div>

        <div className="min-w-0">
          <h1
            className="
              text-sm
              font-bold
              leading-snug
              tracking-tight
              text-gray-900
              sm:text-base
              md:text-lg
              lg:text-xl
            "
          >
            CMSC ALLUMNI LATE HAMZA HAJI IBRAHIM MUKADAM
            CRICKET MEMORIAL CUP - 2026
          </h1>

          {/* Live status */}
          <div className="mt-1.5 flex items-center gap-2">
            <div
              className="
                flex
                items-center
                gap-1.5
                rounded-full
                border
                border-red-200
                bg-red-50
                px-2.5
                py-1
              "
            >
              <span
                className={`
                  h-1.5
                  w-1.5
                  rounded-full
                  ${
                    isConnected
                      ? "animate-pulse bg-emerald-500"
                      : "bg-red-500"
                  }
                `}
              />

              <span
                className={`
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wider
                  ${
                    isConnected
                      ? "text-emerald-700"
                      : "text-red-700"
                  }
                `}
              >
                {isConnected ? "Live" : "Offline"}
              </span>
            </div>

            <div
              className="
                flex
                items-center
                gap-1.5
                rounded-full
                border
                border-gray-200
                bg-white/80
                px-2.5
                py-1
              "
            >
              <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                Updated
              </span>

              <span className="text-[10px] font-semibold text-gray-600">
                {lastUpdate || "Just now"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sign out */}
      <form action={signOut} className="shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="
            rounded-lg
            text-gray-700
            hover:bg-blue-50
            hover:text-blue-700
            btn-scale
          "
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </form>
    </div>
  </div>
</header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="
            grid
            w-full
            grid-cols-7
            rounded-xl
            border
            border-blue-100/80
            bg-white/90
            p-1
            shadow-[0_6px_20px_rgba(30,64,175,0.08)]
            backdrop-blur-sm
          ">
            <TabsTrigger
              value="overview"
              className="
                rounded-lg
                text-gray-600
                transition-all
                duration-200
                data-[state=active]:bg-gradient-to-r
                data-[state=active]:from-blue-600
                data-[state=active]:to-blue-700
                data-[state=active]:text-white
                data-[state=active]:shadow-md
                hover:bg-amber-50/70
              "
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="auction"
              className="
                rounded-lg
                text-gray-600
                transition-all
                duration-200
                data-[state=active]:bg-gradient-to-r
                data-[state=active]:from-blue-600
                data-[state=active]:to-blue-700
                data-[state=active]:text-white
                data-[state=active]:shadow-md
                hover:bg-amber-50/70
              "
            >
              Auction
            </TabsTrigger>
            <TabsTrigger
              value="players"
              className="
                rounded-lg
                text-gray-600
                transition-all
                duration-200
                data-[state=active]:bg-gradient-to-r
                data-[state=active]:from-blue-600
                data-[state=active]:to-blue-700
                data-[state=active]:text-white
                data-[state=active]:shadow-md
                hover:bg-amber-50/70
              "
            >
              Players
            </TabsTrigger>
            <TabsTrigger
              value="teams"
              className="
                rounded-lg
                text-gray-600
                transition-all
                duration-200
                data-[state=active]:bg-gradient-to-r
                data-[state=active]:from-blue-600
                data-[state=active]:to-blue-700
                data-[state=active]:text-white
                data-[state=active]:shadow-md
                hover:bg-amber-50/70
              "
            >
              Teams
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="
                rounded-lg
                text-gray-600
                transition-all
                duration-200
                data-[state=active]:bg-gradient-to-r
                data-[state=active]:from-blue-600
                data-[state=active]:to-blue-700
                data-[state=active]:text-white
                data-[state=active]:shadow-md
                hover:bg-amber-50/70
              "
            >
              Users
            </TabsTrigger>
            <TabsTrigger
              value="rules"
              className="
                rounded-lg
                text-gray-600
                transition-all
                duration-200
                data-[state=active]:bg-gradient-to-r
                data-[state=active]:from-blue-600
                data-[state=active]:to-blue-700
                data-[state=active]:text-white
                data-[state=active]:shadow-md
                hover:bg-amber-50/70
              "
            >
              Rules
            </TabsTrigger>
            <TabsTrigger
              value="audit"
              className="
                rounded-lg
                text-gray-600
                transition-all
                duration-200
                data-[state=active]:bg-gradient-to-r
                data-[state=active]:from-blue-600
                data-[state=active]:to-blue-700
                data-[state=active]:text-white
                data-[state=active]:shadow-md
                hover:bg-amber-50/70
              "
            >
              Audit
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="rounded-2xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-amber-50/35 shadow-[0_8px_24px_rgba(30,64,175,0.08)]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold tracking-tight text-gray-900">Total Players</CardTitle>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-100 bg-gradient-to-br from-blue-50 to-amber-50 text-blue-600"><Users className="h-4 w-4" /></span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{auctionOverview.total_players || 0}</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge className="status-sold rounded-full px-2 py-1 text-xs font-medium">
                      Sold: {auctionOverview.sold_players || 0}
                    </Badge>
                    <Badge className="status-unsold rounded-full px-2 py-1 text-xs font-medium">
                      Unsold: {auctionOverview.unsold_players || 0}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-amber-50/35 shadow-[0_8px_24px_rgba(30,64,175,0.08)]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold tracking-tight text-gray-900">Total Teams</CardTitle>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-100 bg-gradient-to-br from-blue-50 to-amber-50 text-blue-600"><Trophy className="h-4 w-4" /></span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{auctionOverview.total_teams || 0}</div>
                  <p className="text-xs text-gray-500 mt-2">Active franchises</p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-amber-50/35 shadow-[0_8px_24px_rgba(30,64,175,0.08)]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold tracking-tight text-gray-900">Total Budget</CardTitle>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-100 bg-gradient-to-br from-blue-50 to-amber-50 text-blue-600"><DollarSign className="h-4 w-4" /></span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(auctionOverview.total_budget || 0)}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Remaining budget</p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-amber-50/35 shadow-[0_8px_24px_rgba(30,64,175,0.08)]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold tracking-tight text-gray-900">Total Spent</CardTitle>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-100 bg-gradient-to-br from-blue-50 to-amber-50 text-blue-600"><Activity className="h-4 w-4" /></span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {(auctionOverview.total_spent || 0)}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">In player purchases</p>
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-2xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-amber-50/35 shadow-[0_8px_24px_rgba(30,64,175,0.08)]">
              <CardHeader>
                <CardTitle className="text-gray-900 font-semibold">Recent Activity</CardTitle>
                <CardDescription className="text-gray-500">Latest player assignments and transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.assignments.slice(0, 5).map((assignment: any, index: number) => (
                    <div
                      key={assignment.id}
                      className={`flex items-center justify-between rounded-xl border border-blue-100/70 bg-gradient-to-r from-blue-50/35 via-white to-amber-50/25 p-4 shadow-sm transition-shadow fade-in hover:shadow-md`}
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
                          {formatCurrency(assignment.final_price)}
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

          <TabsContent value="rules">
            <RulesTab />
          </TabsContent>

          <TabsContent value="audit">
            <AuditTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
