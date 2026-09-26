"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Users,
  DollarSign,
  TrendingUp,
  Search,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react"
import { useRealtimeTeams } from "@/hooks/use-realtime-teams"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"

interface TeamsStandingsTabProps {
  teams: any[]
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)

export default function TeamsStandingsTab({
  teams,
}: TeamsStandingsTabProps) {
  const { teamSummaries, loading } = useRealtimeTeams(teams)

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTeam, setSelectedTeam] = useState<string>("all")
  const [expandedTeams, setExpandedTeams] = useState<Set<number>>(
    new Set()
  )
  const [sortBy, setSortBy] = useState<
    "spent" | "remaining" | "squad"
  >("spent")

  // ---------------------------------------------------------
  // LEADERSHIP IMAGE LIGHTBOX
  // ---------------------------------------------------------

  const [selectedLeaderImage, setSelectedLeaderImage] =
    useState<string | null>(null)

  const [selectedLeaderName, setSelectedLeaderName] =
    useState("")

  const openLeaderImage = (
    image: string,
    name: string
  ) => {
    setSelectedLeaderImage(image)
    setSelectedLeaderName(name)
  }

  const closeLeaderImage = () => {
    setSelectedLeaderImage(null)
    setSelectedLeaderName("")
  }

  // Handle Escape key and prevent page scrolling
  // while leadership image is open.
  useEffect(() => {
    if (!selectedLeaderImage) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedLeaderImage(null)
        setSelectedLeaderName("")
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown
    )

    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      )

      document.body.style.overflow = ""
    }
  }, [selectedLeaderImage])

  // ---------------------------------------------------------
  // BUDGET
  // ---------------------------------------------------------

  const totalBudget = 150000 // 9 Lakhs

  // ---------------------------------------------------------
  // FILTERING
  // ---------------------------------------------------------

  const filteredTeams = teamSummaries.filter((team) => {
    const matchesSearch =
      team.team_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ?? false

    const matchesTeamFilter =
      selectedTeam === "all" ||
      team.team_id.toString() === selectedTeam

    return matchesSearch && matchesTeamFilter
  })

  // Copy before sorting so we don't mutate filteredTeams.
  // const sortedTeams = [...filteredTeams].sort((a, b) => {
  //   if (sortBy === "spent") {
  //     return (
  //       (b.total_spent || 0) -
  //       (a.total_spent || 0)
  //     )
  //   }

  //   if (sortBy === "remaining") {
  //     return (
  //       (b.budget || 0) -
  //       (a.budget || 0)
  //     )
  //   }

  //   if (sortBy === "squad") {
  //     return (
  //       (b.players_count || 0) -
  //       (a.players_count || 0)
  //     )
  //   }

  //   return 0
  // })

  const sortedTeams = [...filteredTeams].sort((a, b) => {
  const aIsReserves =
    a.team_name?.trim().toLowerCase() === "reserves"

  const bIsReserves =
    b.team_name?.trim().toLowerCase() === "reserves"

  // Always keep Reserves at the very bottom
  if (aIsReserves && !bIsReserves) {
    return 1
  }

  if (!aIsReserves && bIsReserves) {
    return -1
  }

  // Normal sorting for all other teams
  if (sortBy === "spent") {
    return (
      (b.total_spent || 0) -
      (a.total_spent || 0)
    )
  }

  if (sortBy === "remaining") {
    return (
      (b.budget || 0) -
      (a.budget || 0)
    )
  }

  if (sortBy === "squad") {
    return (
      (b.players_count || 0) -
      (a.players_count || 0)
    )
  }

  return 0
})

  // ---------------------------------------------------------
  // EXPAND / COLLAPSE PLAYERS
  // ---------------------------------------------------------

  const toggleExpandedPlayers = (
    teamId: number
  ) => {
    const newExpanded = new Set(expandedTeams)

    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId)
    } else {
      newExpanded.add(teamId)
    }

    setExpandedTeams(newExpanded)
  }

  // ---------------------------------------------------------
  // LOADING
  // ---------------------------------------------------------

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">
          Loading team data...
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------

  return (
    <>
      <div className="w-full min-w-0 space-y-4 pb-24 sm:pb-6">

        {/* ================================================= */}
        {/* SEARCH + FILTER BAR                              */}
        {/* ================================================= */}

        <Card className="w-full bg-white border-gray-200 shadow-sm">
          <CardHeader className="pb-3">

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">

              {/* Search */}
              <div className="flex-1 min-w-0 relative">
                <Search
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    h-4
                    w-4
                    text-gray-400
                  "
                />

                <Input
                  placeholder="Search teams..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                  className="
                    w-full
                    pl-10
                    bg-white
                    border-gray-200
                  "
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2 w-full sm:w-auto min-w-0">

                {/* Team Filter */}
                <div className="flex-1 sm:flex-none min-w-0">
                  <Select
                    value={selectedTeam}
                    onValueChange={setSelectedTeam}
                  >
                    <SelectTrigger
                      className="
                        w-full
                        sm:w-[180px]
                        bg-white
                        border
                        border-gray-200
                        text-gray-900
                        text-sm
                        h-9
                        rounded-md
                        shadow-sm
                        hover:border-gray-300
                        focus:ring-1
                        focus:ring-blue-500
                        focus:ring-offset-1
                      "
                    >
                      <Users className="h-3 w-3 mr-2 text-gray-400 flex-shrink-0" />

                      <SelectValue placeholder="Filter Teams" />
                    </SelectTrigger>

                    <SelectContent className="bg-white border border-gray-200 text-gray-900">

                      <SelectItem
                        value="all"
                        className="
                          text-gray-900
                          data-[highlighted]:bg-blue-50
                          data-[highlighted]:text-blue-900
                        "
                      >
                        All Teams
                      </SelectItem>

                      {teamSummaries.map((team) => (
                        <SelectItem
                          key={team.team_id}
                          value={team.team_id.toString()}
                          className="
                            text-gray-900
                            data-[highlighted]:bg-blue-50
                            data-[highlighted]:text-blue-900
                          "
                        >
                          {team.team_name}
                        </SelectItem>
                      ))}

                    </SelectContent>
                  </Select>
                </div>

                {/* Sort Filter */}
                <div className="flex-1 sm:flex-none min-w-0">
                  <Select
                    value={sortBy}
                    onValueChange={(val) =>
                      setSortBy(
                        val as
                          | "spent"
                          | "remaining"
                          | "squad"
                      )
                    }
                  >
                    <SelectTrigger
                      className="
                        w-full
                        sm:w-[140px]
                        bg-white
                        border
                        border-gray-200
                        text-gray-900
                        text-sm
                        h-9
                        rounded-md
                        shadow-sm
                        hover:border-gray-300
                        focus:ring-1
                        focus:ring-blue-500
                        focus:ring-offset-1
                      "
                    >
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>

                    <SelectContent className="bg-white border border-gray-200 text-gray-900">

                      <SelectItem
                        value="spent"
                        className="
                          text-gray-900
                          data-[highlighted]:bg-blue-50
                          data-[highlighted]:text-blue-900
                        "
                      >
                        Spending
                      </SelectItem>

                      <SelectItem
                        value="remaining"
                        className="
                          text-gray-900
                          data-[highlighted]:bg-blue-50
                          data-[highlighted]:text-blue-900
                        "
                      >
                        Remaining Budget
                      </SelectItem>

                      <SelectItem
                        value="squad"
                        className="
                          text-gray-900
                          data-[highlighted]:bg-blue-50
                          data-[highlighted]:text-blue-900
                        "
                      >
                        Squad Size
                      </SelectItem>

                    </SelectContent>
                  </Select>
                </div>

              </div>
            </div>

          </CardHeader>
        </Card>

        {/* ================================================= */}
        {/* INDIVIDUAL TEAM CARDS                            */}
        {/* ================================================= */}

        <div className="w-full min-w-0 space-y-3">

          {sortedTeams.map((team, idx) => (

            <Card
              key={team.team_id}
              className={`
                w-full
                min-w-0
                bg-white
                border-gray-200
                shadow-sm
                transition-all
                hover:shadow-md
                hover:-translate-y-0.5
                ${
                  idx === 0
                    ? "border-yellow-400"
                    : ""
                }
              `}
            >

              {/* ========================================= */}
              {/* TEAM HEADER                               */}
              {/* ========================================= */}

              <CardHeader className="pb-3">

                <div className="flex items-center justify-between gap-3">

                  <div className="flex items-center gap-3 min-w-0">

                    {/* Team Logo */}
                    <div
                      className="
                        w-16 h-16
                        sm:w-20 sm:h-20
                        md:w-24 md:h-24
                        flex
                        items-center
                        justify-center
                        flex-shrink-0
                      "
                    >
                      <img
                        src={
                          team.team_logo ||
                          "/placeholder.svg?height=60&width=60&query=cricket team logo"
                        }
                        alt={`${team.team_name} logo`}
                        className="
                          block
                          w-auto
                          h-auto
                          max-w-full
                          max-h-full
                          object-contain
                        "
                      />
                    </div>

                    {/* Team Name */}
                    <CardTitle
                      className="
                        text-gray-900
                        text-base
                        min-w-0
                        break-words
                      "
                    >
                      {team.team_name}
                    </CardTitle>

                  </div>

                  {/* Players Count */}
                  <Badge
                    variant="outline"
                    className="
                      text-xs
                      whitespace-nowrap
                      flex-shrink-0
                    "
                  >
                    {team.players_count || 0} players
                  </Badge>

                </div>

              </CardHeader>

              {/* ========================================= */}
              {/* TEAM CONTENT                              */}
              {/* ========================================= */}

              <CardContent className="space-y-4">

                {/* ======================================= */}
                {/* BUDGET PROGRESS                         */}
                {/* ======================================= */}

                <div className="space-y-2">

                  <div
                    className="
                      flex
                      justify-between
                      gap-3
                      text-sm
                    "
                  >

                    <span className="text-gray-400">
                      Budget Used
                    </span>

                    <span className="text-gray-900 whitespace-nowrap">
                      {formatCurrency(
                        team.total_spent || 0
                      )}{" "}
                      / ₹2L
                    </span>

                  </div>

                  <Progress
                    value={
                      ((team.total_spent || 0) /
                        totalBudget) *
                      100
                    }
                    className="
                      h-2
                      transition-all
                    "
                  />

                </div>

                {/* ======================================= */}
                {/* STATS GRID                             */}
                {/* ======================================= */}

                <div
                  className="
                    grid
                    grid-cols-3
                    gap-2
                    sm:gap-3
                  "
                >

                  {/* Remaining */}
                  <div
                    className="
                      text-center
                      p-2
                      sm:p-3
                      bg-gray-50
                      rounded-lg
                      min-w-0
                    "
                  >
                    <DollarSign
                      className="
                        h-4
                        w-4
                        text-green-500
                        mx-auto
                        mb-1
                      "
                    />

                    <p
                      className="
                        text-gray-900
                        font-medium
                        text-xs
                        sm:text-sm
                        truncate
                      "
                    >
                      {formatCurrency(
                        team.budget
                      )}
                    </p>

                    <p className="text-gray-400 text-xs">
                      Remaining
                    </p>
                  </div>

                  {/* Squad */}
                  <div
                    className="
                      text-center
                      p-2
                      sm:p-3
                      bg-gray-50
                      rounded-lg
                      min-w-0
                    "
                  >
                    <Users
                      className="
                        h-4
                        w-4
                        text-blue-500
                        mx-auto
                        mb-1
                      "
                    />

                    <p className="text-gray-900 font-medium text-sm">
                      {team.players_count || 0}
                    </p>

                    <p className="text-gray-400 text-xs">
                      Squad Size
                    </p>
                  </div>

                  {/* Used */}
                  <div
                    className="
                      text-center
                      p-2
                      sm:p-3
                      bg-gray-50
                      rounded-lg
                      min-w-0
                    "
                  >
                    <TrendingUp
                      className="
                        h-4
                        w-4
                        text-purple-500
                        mx-auto
                        mb-1
                      "
                    />

                    <p className="text-gray-900 font-medium text-sm">
                      {(
                        ((team.total_spent || 0) /
                          totalBudget) *
                        100
                      ).toFixed(0)}
                      %
                    </p>

                    <p className="text-gray-400 text-xs">
                      Used
                    </p>
                  </div>

                </div>

                {/* ======================================= */}
                {/* TEAM LEADERSHIP                        */}
                {/* ======================================= */}

                <div>

                  <p className="text-gray-400 text-sm mb-3">
                    Team Leadership
                  </p>

                  <div
                    className="
                      grid
                      grid-cols-3
                      gap-2
                      sm:gap-3
                      mb-4
                    "
                  >

                    {/* ================================= */}
                    {/* OWNER                              */}
                    {/* ================================= */}

                    <div className="text-center min-w-0">

                      <button
                        type="button"
                        onClick={() =>
                          openLeaderImage(
                            team.owner_image ||
                              "/placeholder.svg?height=300&width=300&query=team owner portrait",
                            team.owner_name ||
                              "Team Owner"
                          )
                        }
                        className="
                          group
                          mx-auto
                          mb-1
                          block

                          w-16 h-16
                          sm:w-20 sm:h-20
                          md:w-24 md:h-24

                          rounded-full
                          border-2
                          border-blue-500
                          bg-gray-50

                          cursor-zoom-in

                          focus:outline-none
                          focus:ring-2
                          focus:ring-blue-500
                        "
                        aria-label={`View ${
                          team.owner_name ||
                          "Team Owner"
                        } photo`}
                      >
                        <img
                          src={
                            team.owner_image ||
                            "/placeholder.svg?height=300&width=300&query=team owner portrait"
                          }
                          alt={
                            team.owner_name ||
                            "Team Owner"
                          }
                          className="
                            block
                            w-full
                            h-full
                            rounded-full
                            object-contain
                            p-1
                            transition-transform
                            duration-200
                            group-hover:scale-105
                          "
                        />
                      </button>

                      <p
                        className="
                          text-gray-900
                          text-xs
                          font-medium
                          truncate
                        "
                      >
                        {team.owner_name ||
                          "Owner"}
                      </p>

                      <p className="text-gray-400 text-xs">
                        Owner
                      </p>

                    </div>

                    {/* ================================= */}
                    {/* CAPTAIN                            */}
                    {/* ================================= */}

                    <div className="text-center min-w-0">

                      <button
                        type="button"
                        onClick={() =>
                          openLeaderImage(
                            team.captain_image ||
                              "/placeholder.svg?height=300&width=300&query=cricket captain portrait",
                            team.captain_name ||
                              "Team Captain"
                          )
                        }
                        className="
                          group
                          mx-auto
                          mb-1
                          block

                          w-16 h-16
                          sm:w-20 sm:h-20
                          md:w-24 md:h-24

                          rounded-full
                          border-2
                          border-blue-500
                          bg-gray-50

                          cursor-zoom-in

                          focus:outline-none
                          focus:ring-2
                          focus:ring-blue-500
                        "
                        aria-label={`View ${
                          team.captain_name ||
                          "Team Captain"
                        } photo`}
                      >
                        <img
                          src={
                            team.captain_image ||
                            "/placeholder.svg?height=300&width=300&query=cricket captain portrait"
                          }
                          alt={
                            team.captain_name ||
                            "Team Captain"
                          }
                          className="
                            block
                            w-full
                            h-full
                            rounded-full
                            object-contain
                            p-1
                            transition-transform
                            duration-200
                            group-hover:scale-105
                          "
                        />
                      </button>

                      <p
                        className="
                          text-gray-900
                          text-xs
                          font-medium
                          truncate
                        "
                      >
                        {team.captain_name ||
                          "Captain"}
                      </p>

                      <p className="text-gray-400 text-xs">
                        Captain
                      </p>

                    </div>

                    {/* ================================= */}
                    {/* VICE CAPTAIN                       */}
                    {/* ================================= */}

                    <div className="text-center min-w-0">

                      <button
                        type="button"
                        onClick={() =>
                          openLeaderImage(
                            team.vice_captain_image ||
                              "/placeholder.svg?height=300&width=300&query=cricket vice captain portrait",
                            team.vice_captain_name ||
                              "Vice Captain"
                          )
                        }
                        className="
                          group
                          mx-auto
                          mb-1
                          block

                          w-16 h-16
                          sm:w-20 sm:h-20
                          md:w-24 md:h-24

                          rounded-full
                          border-2
                          border-blue-500
                          bg-gray-50

                          cursor-zoom-in

                          focus:outline-none
                          focus:ring-2
                          focus:ring-blue-500
                        "
                        aria-label={`View ${
                          team.vice_captain_name ||
                          "Vice Captain"
                        } photo`}
                      >
                        <img
                          src={
                            team.vice_captain_image ||
                            "/placeholder.svg?height=300&width=300&query=cricket vice captain portrait"
                          }
                          alt={
                            team.vice_captain_name ||
                            "Vice Captain"
                          }
                          className="
                            block
                            w-full
                            h-full
                            rounded-full
                            object-contain
                            p-1
                            transition-transform
                            duration-200
                            group-hover:scale-105
                          "
                        />
                      </button>

                      <p
                        className="
                          text-gray-900
                          text-xs
                          font-medium
                          truncate
                        "
                      >
                        {team.vice_captain_name ||
                          "Vice Captain"}
                      </p>

                      <p className="text-gray-400 text-xs">
                        Vice Captain
                      </p>

                    </div>

                  </div>
                </div>

                {/* ======================================= */}
                {/* RECENT ACQUISITIONS                    */}
                {/* ======================================= */}

                {team.players &&
                  team.players.length > 0 && (

                    <div>

                      <p className="text-gray-400 text-sm mb-2">
                        Recent Acquisitions
                      </p>

                      <div className="space-y-2">

                        {(expandedTeams.has(
                          team.team_id
                        )
                          ? team.players
                          : team.players.slice(0, 3)
                        ).map((player: any) => (

                          <div
                            key={player.id}
                            className="
                              flex
                              items-center
                              justify-between
                              gap-3
                              text-sm
                              p-2
                              bg-gray-50
                              rounded-md
                              hover:bg-gray-100
                            "
                          >

                            <div
                              className="
                                flex
                                items-center
                                gap-2
                                min-w-0
                              "
                            >

                              <img
                                src={
                                  player.image ||
                                  "/placeholder.svg?height=32&width=32&query=cricket player portrait"
                                }
                                alt={player.name}
                                className="
                                  w-8
                                  h-8
                                  rounded-md
                                  object-contain
                                  border
                                  border-gray-200
                                  flex-shrink-0
                                "
                              />

                              <div className="min-w-0">

                                <p
                                  className="
                                    text-gray-900
                                    font-medium
                                    truncate
                                  "
                                >
                                  {player.name}
                                </p>

                                <span
                                  className="
                                    inline-block
                                    px-2
                                    py-0.5
                                    text-xs
                                    rounded-full
                                    bg-blue-100
                                    text-blue-700
                                    whitespace-nowrap
                                  "
                                >
                                  {player.position}
                                </span>

                              </div>

                            </div>

                            {/* <p
                              className="
                                text-amber-500
                                font-semibold
                                whitespace-nowrap
                                flex-shrink-0
                              "
                            >
                              {formatCurrency(
                                player.final_price
                              )}
                            </p> */}

                          </div>

                        ))}

                        {/* Show More / Less */}
                        {team.players.length > 3 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              toggleExpandedPlayers(
                                team.team_id
                              )
                            }
                            className="
                              w-full
                              text-gray-600
                              hover:text-gray-800
                              hover:bg-gray-50
                            "
                          >

                            {expandedTeams.has(
                              team.team_id
                            ) ? (
                              <>
                                <ChevronUp className="h-4 w-4 mr-1" />
                                Show Less
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-4 w-4 mr-1" />
                                +
                                {team.players.length -
                                  3}{" "}
                                more players
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

      {/* ===================================================== */}
      {/* LEADERSHIP IMAGE LIGHTBOX                             */}
      {/* ===================================================== */}

      {selectedLeaderImage && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-black/70
            p-3
            sm:p-6
          "
          onClick={closeLeaderImage}
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedLeaderName} photo`}
        >

          <div
            className="
              relative
              flex
              items-center
              justify-center

              w-full
              h-full

              max-w-[1200px]
              max-h-screen
            "
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* Full-size image */}
            <img
              src={selectedLeaderImage}
              alt={selectedLeaderName}
              className="
                block

                max-w-full
                max-h-[88vh]

                sm:max-h-[90vh]

                w-auto
                h-auto

                object-contain

                rounded-xl
                shadow-2xl
              "
            />

            {/* Close Button */}
            <button
              type="button"
              onClick={closeLeaderImage}
              className="
                absolute

                top-2
                right-2

                sm:top-3
                sm:right-3

                flex
                items-center
                justify-center

                w-9
                h-9

                sm:w-10
                sm:h-10

                rounded-full
                bg-white
                text-gray-700
                shadow-lg

                hover:bg-gray-100

                transition-colors

                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
              "
              aria-label="Close image"
            >
              <X className="w-5 h-5" />
            </button>

          </div>
        </div>
      )}
    </>
  )
}