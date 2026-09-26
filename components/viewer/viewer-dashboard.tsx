"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import {
  LogOut,
  Trophy,
  Users,
  PlayCircle,
  Users2,
  ShoppingBag,
  Star,
  Copyright,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { signOut } from "@/lib/actions"
import { useRealtimeAuction } from "@/hooks/use-realtime-auction"
import LiveAuctionTab from "./live-auction-tab"
import PlayersListTab from "./players-list-tab"
import TeamsStandingsTab from "./teams-standings-tab"
import RecentSalesTab from "./recent-sales-tab"
import RulesTab from "./rules-tab"

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
      previous_team?: string
      city?: string
    } | null
  }
}

function GroupsTab({ teams }: { teams: any[] }) {
  const groupAIds = [11, 5, 3, 4, 2, 10]
  const groupBIds = [1, 8, 9, 6, 7, 12]

  const groupA = teams.filter((team) => groupAIds.includes(team.id))
  const groupB = teams.filter((team) => groupBIds.includes(team.id))

  const GroupTable = ({
    title,
    teams,
  }: {
    title: string
    teams: any[]
  }) => (
    <Card className="border-2 border-amber-500 shadow-sm">
      <CardContent className="p-4">
        <h3 className="mb-3 text-base font-bold text-gray-900">
          {title}
        </h3>

        <div className="space-y-2">
          {teams.map((team, idx) => (
            <div
              key={team.id}
              className="
                flex
                items-center
                justify-between
                rounded-lg
                p-2
                transition-colors
                hover:bg-gray-50
              "
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className="w-6 shrink-0 text-sm font-medium text-gray-500">
                  {idx + 1}
                </span>

                {team.team_logo && (
                  <img
                    src={team.team_logo}
                    alt={team.name}
                    className="h-8 w-8 shrink-0 object-contain"
                  />
                )}

                {/* Never truncate team names */}
                <span
                  className="
                    break-words
                    whitespace-normal
                    rounded-md
                    border
                    border-amber-500
                    px-2
                    py-1
                    text-sm
                    font-medium
                    text-gray-900
                  "
                >
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

export default function ViewerDashboard({
  user,
  initialData,
}: ViewerDashboardProps) {
  const [activeTab, setActiveTab] = useState("live")

  const { data, isConnected, lastUpdate } =
    useRealtimeAuction(initialData)

  const { auctionOverview } = data

  const availablePlayers = data.players.filter(
    (player) => player.status === "available"
  )

  const currentPlayer = data.currentPlayer || null

  const soldPlayers = auctionOverview?.sold_players || 0
  const playersAvailable = availablePlayers.length

  const tabs = [
    {
      key: "live",
      label: "Live",
      Icon: PlayCircle,
    },
    {
      key: "players",
      label: "Players",
      Icon: Users2,
    },
    {
      key: "teams",
      label: "Teams",
      Icon: Trophy,
    },
    {
      key: "sales",
      label: "Sales",
      Icon: ShoppingBag,
    },
    {
      key: "rules",
      label: "Rules",
      Icon: FileText,
    },
    {
      key: "sponsors",
      label: "Sponsors",
      Icon: Star,
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">

      {/* =========================================================
          STICKY HEADER
          ========================================================= */}
{/* =========================================================
    STICKY HEADER
    ========================================================= */}
<header
  className="
    sticky
    top-0
    z-50
    border-b
    border-amber-200
    bg-gradient-to-r
    from-amber-100
    via-white
    to-amber-50
    shadow-sm
  "
>
  <div
    className="
      mx-auto
      grid
      h-[64px]
      w-full
      max-w-[1600px]
      grid-cols-[auto_1fr_auto]
      items-center
      gap-2
      px-3
      sm:h-[70px]
      sm:gap-4
      sm:px-5
      lg:px-6
    "
  >
    {/* =====================================================
        LEFT - LOGO
        ===================================================== */}
    <div className="flex items-center">
      <div
        className="
          flex
          h-14
          w-14
          shrink-0
          items-center
          justify-center
          rounded-2xl
          bg-white/85
          shadow-sm
          ring-1
          ring-amber-200
          sm:h-16
          sm:w-16
          md:h-[68px]
          md:w-[68px]
        "
      >
        <img
          src="https://media.cmscallumni.in/teams/images/cmsclogobg.webp"
          alt="CMSC Logo"
          className="
            h-12
            w-12
            object-contain
            sm:h-14
            sm:w-14
            md:h-16
            md:w-16
          "
        />
      </div>
    </div>

    {/* =====================================================
        CENTER - CMSC ALLUMNI
        ===================================================== */}
    <div className="min-w-0 text-center">
      <p
        className="
          whitespace-nowrap
          text-[13px]
          font-extrabold
          tracking-[0.06em]
          text-amber-700
          sm:text-base
          md:text-lg
        "
      >
        CMSC ALLUMNI
      </p>
    </div>

    {/* =====================================================
        RIGHT - LIVE + LOGOUT
        ===================================================== */}
    <div className="flex items-center gap-1.5 sm:gap-2">

      {/* Live status */}
      <div
        className={`
          flex
          items-center
          gap-1.5
          rounded-full
          px-2.5
          py-1.5
          text-xs
          font-medium
          shadow-sm
          ring-1
          sm:px-3
          ${
            isConnected
              ? "bg-green-50/95 text-green-700 ring-green-200"
              : "bg-red-50/95 text-red-700 ring-red-200"
          }
        `}
      >
        <span
          className={`
            relative
            h-2
            w-2
            shrink-0
            rounded-full
            ${
              isConnected
                ? "bg-green-500"
                : "bg-red-500"
            }
          `}
        >
          {isConnected && (
            <span className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-60" />
          )}
        </span>

        <span className="font-semibold">
          {isConnected ? "LIVE" : "OFFLINE"}
        </span>

        <span className="hidden text-gray-400 sm:inline">
          •
        </span>

        <span className="whitespace-nowrap text-gray-500">
          <span className="hidden sm:inline">
            Updated{" "}
          </span>
          {lastUpdate}
        </span>
      </div>

      {/* Logout */}
      {user && (
        <form action={signOut}>
          <Button
            variant="ghost"
            size="sm"
            className="
              h-9
              w-9
              rounded-full
              p-0
              text-gray-600
              hover:bg-white/70
              hover:text-gray-900
            "
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      )}
    </div>
  </div>
</header>

      {/* =========================================================
          TOURNAMENT MASTHEAD
          ========================================================= */}
      <section
        className="
          border-b
          border-amber-100
          bg-gradient-to-r
          from-amber-50
          via-white
          to-amber-50
        "
      >
        <div
          className="
            mx-auto
            max-w-[1500px]
            px-4
            py-3
            text-center
            sm:px-6
            sm:py-4
            lg:px-8
          "
        >
              {/* <p
      className="
        text-[15px]
        font-extrabold
        uppercase
        tracking-[0.08em]
        text-amber-600
        sm:text-lg
        md:text-xl
      "
    >
      CMSC ALLUMNI
    </p> */}

          <h1
            className="
              mx-auto
              mt-1
              max-w-6xl
              break-words
              whitespace-normal
              text-[16px]
              font-extrabold
              leading-[1.2]
              tracking-tight
              text-gray-900
              sm:text-xl
              md:text-2xl
              lg:text-3xl
            "
          >
            LATE HAMZA HAJI IBRAHIM MUKADAM

            <span className="mt-1 block text-amber-700">
              CRICKET MEMORIAL CUP - 2026
            </span>
          </h1>
        </div>
      </section>

      {/* =========================================================
          LIVE AUCTION STRIP
          ========================================================= */}
      {currentPlayer && (
        <div className="border-b border-red-100 bg-red-50/70">
          <div
            className="
              mx-auto
              flex
              w-full
              max-w-[1500px]
              items-center
              justify-between
              gap-4
              px-4
              py-2
              sm:px-6
              sm:py-2.5
              lg:px-8
            "
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className="relative flex h-7 w-7 shrink-0 items-center justify-center">
                <span className="absolute h-7 w-7 animate-ping rounded-full bg-red-300 opacity-40" />

                <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-red-500">
                  <PlayCircle className="h-4 w-4 text-white" />
                </span>
              </span>

              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-red-500 sm:text-xs">
                  Live Auction
                </p>

                <p className="text-sm font-semibold text-gray-900">
                  Player on Auction
                </p>
              </div>
            </div>

            <div className="min-w-0 max-w-[45%] text-right sm:max-w-[55%]">
              <p className="break-words whitespace-normal text-sm font-bold text-gray-900 sm:text-base">
                {currentPlayer.name}
              </p>

              {currentPlayer.position && (
                <p className="break-words whitespace-normal text-xs font-medium text-amber-600 sm:text-sm">
                  {currentPlayer.position}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          COMPACT AUCTION STATS
          ========================================================= */}
      {/* =========================================================
    COMPACT AUCTION STATS
    ========================================================= */}
<div
  className="
    mx-auto
    w-full
    max-w-[1500px]
    px-3
    py-1.5
    sm:px-4
    sm:py-2
    lg:px-6
  "
>
  <Card
    className="
      overflow-hidden
      rounded-xl
      border
      border-gray-200
      bg-white
      shadow-sm
    "
  >
    <CardContent className="p-0">
      <div className="grid grid-cols-2 divide-x divide-gray-200">

        {/* Players Sold */}
        <div
          className="
            flex
            items-center
            gap-2
            px-3
            py-2
            sm:gap-2.5
            sm:px-4
            sm:py-2.5
          "
        >
          <div
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-blue-100
              sm:h-9
              sm:w-9
            "
          >
            <Users className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" />
          </div>

          <div className="min-w-0">
            <p
              className="
                text-[9px]
                font-medium
                uppercase
                tracking-wide
                text-gray-500
                sm:text-[10px]
              "
            >
              Players Sold
            </p>

            <p className="mt-0.5 text-lg font-bold leading-none text-gray-900 sm:text-xl">
              {soldPlayers}
            </p>
          </div>
        </div>

        {/* Available */}
        <div
          className="
            flex
            items-center
            gap-2
            px-3
            py-2
            sm:gap-2.5
            sm:px-4
            sm:py-2.5
          "
        >
          <div
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-amber-100
              sm:h-9
              sm:w-9
            "
          >
            <Users2 className="h-4 w-4 text-amber-600 sm:h-5 sm:w-5" />
          </div>

          <div className="min-w-0">
            <p
              className="
                text-[9px]
                font-medium
                uppercase
                tracking-wide
                text-gray-500
                sm:text-[10px]
              "
            >
              Available
            </p>

            <p className="mt-0.5 text-lg font-bold leading-none text-gray-900 sm:text-xl">
              {playersAvailable}
            </p>
          </div>
        </div>

      </div>
    </CardContent>
  </Card>
</div>

      {/* =========================================================
          MAIN CONTENT
          ========================================================= */}
      <div
        className="
          mx-auto
          flex
          w-full
          max-w-[1500px]
          flex-1
          px-3
          pb-28
          sm:px-4
          sm:pb-32
          lg:px-6
        "
      >
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full space-y-4"
        >
          {/* Live */}
          <TabsContent
            value="live"
            className="w-full space-y-4"
          >
            <LiveAuctionTab
              currentPlayer={currentPlayer}
              data={data}
            />
          </TabsContent>

          {/* Players */}
          <TabsContent
            value="players"
            className="w-full space-y-4"
          >
            <PlayersListTab
              players={data.players}
            />
          </TabsContent>

          {/* Teams */}
          <TabsContent
            value="teams"
            className="w-full space-y-4"
          >
            <TeamsStandingsTab
              teams={data.teams}
            />
          </TabsContent>

          {/* Groups */}
          <TabsContent
            value="groups"
            className="w-full space-y-4"
          >
            <GroupsTab teams={data.teams} />
          </TabsContent>

          {/* Sales */}
          <TabsContent
            value="sales"
            className="w-full space-y-4"
          >
            <RecentSalesTab
              assignments={data.assignments}
            />
          </TabsContent>

          {/* Rules */}
          <TabsContent
            value="rules"
            className="w-full space-y-4"
          >
            <RulesTab />
          </TabsContent>

          {/* Sponsors */}
          <TabsContent
            value="sponsors"
            className="w-full space-y-4"
          >
            <h2 className="text-lg font-bold text-gray-900">
              Our Sponsors
            </h2>

            <div
              className="
                grid
                grid-cols-2
                gap-4
                sm:grid-cols-3
                md:grid-cols-4
              "
            >
              <Card className="flex items-center justify-center p-4 shadow-sm">
                <img
                  src="/logos/sarjif.jpg"
                  alt="Sponsor 8"
                  className="h-12 w-auto object-contain"
                />
              </Card>

              <Card className="flex items-center justify-center p-4 shadow-sm">
                <img
                  src="/logos/mukh.png"
                  alt="Sponsor 7"
                  className="h-12 w-auto object-contain"
                />
              </Card>

              <Card className="flex items-center justify-center p-4 shadow-sm">
                <img
                  src="/logos/Humalogo.jpg"
                  alt="Sponsor 3"
                  className="h-12 w-auto object-contain"
                />
              </Card>

              <Card className="flex items-center justify-center p-4 shadow-sm">
                <img
                  src="/logos/mithiyaaj.jpg"
                  alt="Sponsor 4"
                  className="h-12 w-auto object-contain"
                />
              </Card>


              <Card className="flex items-center justify-center p-4 shadow-sm">
                <img
                  src="/logos/aashiyanalogo.jpg"
                  alt="Sponsor 1"
                  className="h-12 w-auto object-contain"
                />
              </Card>

              <Card className="flex items-center justify-center p-4 shadow-sm">
                <img
                  src="/logos/shahilogo.jpg"
                  alt="Sponsor 5"
                  className="h-12 w-auto object-contain"
                />
              </Card>

              <Card className="flex items-center justify-center p-4 shadow-sm">
                <img
                  src="/logos/sigdi.jpg"
                  alt="Sponsor 6"
                  className="h-12 w-auto object-contain"
                />
              </Card>

              <Card className="flex items-center justify-center p-4 shadow-sm">
                <img
                  src="/logos/designer.jpg"
                  alt="Sponsor 2"
                  className="h-12 w-auto object-contain"
                />
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* =========================================================
          FOOTER
          ========================================================= */}
      <footer
        className="
          mt-auto
          border-t
          border-gray-200
          bg-gradient-to-r
          from-amber-100
          via-white
          to-amber-50
          px-4
          py-6
          pb-20
          sm:pb-20
        "
      >
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col items-center space-y-3">

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Copyright className="h-4 w-4" />

              <span>
                {new Date().getFullYear()} Cmsc Allumni.
                All rights reserved.
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Developed by</span>

              <span className="font-medium text-amber-600">
                Saad Rizwan Aibani
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-0.5 w-8 rounded-full bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
              <div className="h-0.5 w-8 rounded-full bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
            </div>
          </div>
        </div>
      </footer>

      {/* =========================================================
          BOTTOM NAV
          ========================================================= */}
      <nav
        className="
          fixed
          bottom-0
          left-0
          right-0
          z-50
          px-2
          pb-2
          sm:bottom-4
          sm:left-1/2
          sm:right-auto
          sm:-translate-x-1/2
          sm:px-0
          sm:pb-0
        "
      >
        <div className="flex w-full items-center justify-center sm:w-auto">
          <div
            className="
              flex
              w-full
              max-w-sm
              items-center
              justify-between
              rounded-2xl
              border
              border-gray-200/50
              bg-white/95
              p-1
              shadow-lg
              backdrop-blur-md
              sm:w-auto
              sm:max-w-none
            "
          >
            {tabs.map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                aria-label={`${label} tab`}
                onClick={() => setActiveTab(key)}
                className={`
                  flex
                  min-w-0
                  flex-1
                  flex-col
                  items-center
                  justify-center
                  rounded-xl
                  px-2
                  py-2
                  text-xs
                  transition-all
                  duration-300
                  focus:outline-none
                  focus:ring-0
                  sm:flex-none
                  sm:px-3
                  ${
                    activeTab === key
                      ? "bg-blue-100 text-blue-600 shadow-sm"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  }
                `}
              >
                <Icon
                  className={`
                    mb-0.5
                    h-4
                    w-4
                    transition-colors
                    duration-300
                    sm:mb-1
                    sm:h-5
                    sm:w-5
                    ${
                      activeTab === key
                        ? "text-blue-600"
                        : "text-gray-400"
                    }
                  `}
                />

                <span className="whitespace-nowrap text-[10px] leading-tight sm:text-xs">
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