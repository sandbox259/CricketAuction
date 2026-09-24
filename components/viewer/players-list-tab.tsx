"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Filter,
  Users,
  X,
} from "lucide-react"

interface PlayersListTabProps {
  players: any[]
}

export default function PlayersListTab({
  players,
}: PlayersListTabProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [positionFilter, setPositionFilter] = useState("all")
  const [cityFilter, setCityFilter] = useState("all")

  // Lightbox
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedPlayerName, setSelectedPlayerName] = useState("")

  const filteredPlayers = players.filter((player) => {
    const playerName = player.name?.toLowerCase() || ""
    const playerPosition = player.position?.toLowerCase() || ""
    const search = searchTerm.toLowerCase()

    const matchesSearch =
      playerName.includes(search) ||
      playerPosition.includes(search)

    const matchesStatus =
      statusFilter === "all" ||
      player.status === statusFilter

    const matchesPosition =
      positionFilter === "all" ||
      player.position === positionFilter

    const matchesCity =
      cityFilter === "all" ||
      (player.city &&
        player.city.toLowerCase() === cityFilter.toLowerCase())

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPosition &&
      matchesCity
    )
  })

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sold":
        return (
          <Badge className="bg-green-100 text-green-700 text-xs whitespace-nowrap">
            Sold
          </Badge>
        )

      case "unsold":
        return (
          <Badge className="bg-red-100 text-red-700 text-xs whitespace-nowrap">
            Unsold
          </Badge>
        )

      default:
        return (
          <Badge className="bg-blue-100 text-blue-700 text-xs whitespace-nowrap">
            Available
          </Badge>
        )
    }
  }

  const getPositionChip = (position: string) => {
    switch (position) {
      case "Batsman":
        return (
          <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs whitespace-nowrap">
            {position}
          </span>
        )

      case "Bowler":
        return (
          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs whitespace-nowrap">
            {position}
          </span>
        )

      case "All Rounder":
        return (
          <span className="px-2 py-0.5 rounded-full bg-lime-100 text-lime-700 text-xs whitespace-nowrap">
            {position}
          </span>
        )

      case "Wicket-keeper":
        return (
          <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs whitespace-nowrap">
            {position}
          </span>
        )

      default:
        return (
          <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 text-xs whitespace-nowrap">
            {position}
          </span>
        )
    }
  }

  const positions = [
    ...new Set(
      players
        .map((p) => p.position)
        .filter(Boolean)
    ),
  ]

  // ---------------------------------------------------------
  // LIGHTBOX
  // ---------------------------------------------------------

  const openImage = (
    image: string,
    playerName: string
  ) => {
    setSelectedImage(image)
    setSelectedPlayerName(playerName)
  }

  const closeImage = () => {
    setSelectedImage(null)
    setSelectedPlayerName("")
  }

  useEffect(() => {
    if (!selectedImage) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeImage()
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    // Prevent background scrolling
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      )

      document.body.style.overflow = ""
    }
  }, [selectedImage])

  return (
    <>
      {/* ===================================================== */}
      {/* MAIN PLAYERS CONTENT                                 */}
      {/* ===================================================== */}

      <div
        className="
          w-full
          min-w-0
          max-w-none
          space-y-4
          pb-24
          sm:pb-6
        "
      >

        {/* =================================================== */}
        {/* SEARCH + FILTERS                                   */}
        {/* =================================================== */}

        <Card className="w-full bg-white border border-gray-200 rounded-xl shadow-md">
          <CardContent className="p-3 sm:p-4 space-y-3">

            {/* Search */}
            <div className="relative w-full">
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
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
                className="
                  w-full
                  pl-10
                  bg-white
                  border-gray-200
                  text-gray-900
                  text-sm
                  rounded-full
                  focus:ring-2
                  focus:ring-blue-500
                "
              />
            </div>

            {/* Filters */}
            <div
              className="
                grid
                grid-cols-3
                gap-1.5
                sm:gap-3
                w-full
                min-w-0
              "
            >

              {/* Status */}
              <div className="min-w-0">
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger
                    className="
                      w-full
                      min-w-0
                      h-9
                      px-2
                      sm:px-3
                      bg-white
                      border
                      border-gray-200
                      text-gray-900
                      text-[11px]
                      sm:text-sm
                      rounded-md
                      shadow-sm
                      hover:border-gray-300
                      focus:ring-2
                      focus:ring-blue-500
                    "
                  >
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>

                  <SelectContent className="bg-white border border-gray-200 text-gray-900">
                    <SelectItem value="all">
                      All Status
                    </SelectItem>

                    <SelectItem value="available">
                      Available
                    </SelectItem>

                    <SelectItem value="sold">
                      Sold
                    </SelectItem>

                    <SelectItem value="unsold">
                      Unsold
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Position */}
              <div className="min-w-0">
                <Select
                  value={positionFilter}
                  onValueChange={setPositionFilter}
                >
                  <SelectTrigger
                    className="
                      w-full
                      min-w-0
                      h-9
                      px-2
                      sm:px-3
                      bg-white
                      border
                      border-gray-200
                      text-gray-900
                      text-[11px]
                      sm:text-sm
                      rounded-md
                      shadow-sm
                      hover:border-gray-300
                      focus:ring-2
                      focus:ring-blue-500
                    "
                  >
                    <SelectValue placeholder="Position" />
                  </SelectTrigger>

                  <SelectContent className="bg-white border border-gray-200 text-gray-900">
                    <SelectItem value="all">
                      All Positions
                    </SelectItem>

                    {positions.map((position) => (
                      <SelectItem
                        key={position}
                        value={position}
                      >
                        {position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* City */}
              <div className="min-w-0">
                <Select
                  value={cityFilter}
                  onValueChange={setCityFilter}
                >
                  <SelectTrigger
                    className="
                      w-full
                      min-w-0
                      h-9
                      px-2
                      sm:px-3
                      bg-white
                      border
                      border-gray-200
                      text-gray-900
                      text-[11px]
                      sm:text-sm
                      rounded-md
                      shadow-sm
                      hover:border-gray-300
                      focus:ring-2
                      focus:ring-blue-500
                    "
                  >
                    <SelectValue placeholder="City" />
                  </SelectTrigger>

                  <SelectContent className="bg-white border border-gray-200 text-gray-900">
                    <SelectItem value="all">
                      All Cities
                    </SelectItem>

                    <SelectItem value="Mumbai">
                      Mumbai
                    </SelectItem>

                    <SelectItem value="Pune">
                      Pune
                    </SelectItem>

                    <SelectItem value="Bangalore">
                      Bangalore
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* =================================================== */}
        {/* PLAYER COUNT                                       */}
        {/* =================================================== */}

        <div className="flex items-center justify-between px-1 w-full">
          <p className="text-gray-500 text-sm">
            {filteredPlayers.length} player
            {filteredPlayers.length !== 1 ? "s" : ""} found
          </p>

          <Filter className="h-4 w-4 text-gray-400 flex-shrink-0" />
        </div>

        {/* =================================================== */}
        {/* PLAYER LIST                                        */}
        {/* =================================================== */}

        <div className="w-full min-w-0 space-y-3">

          {filteredPlayers.map((player) => (

            <Card
              key={player.id}
              className="
                w-full
                min-w-0
                bg-gradient-to-r
                from-white
                via-gray-50
                to-white
                border
                border-gray-200
                text-sm
                transition-all
                hover:shadow-md
                hover:-translate-y-0.5
                rounded-xl
              "
            >

              <CardContent
                className="
                  w-full
                  min-w-0
                  p-3
                  sm:p-4
                "
              >

                {/* =========================================== */}
                {/* PLAYER HEADER                               */}
                {/* =========================================== */}

                <div
                  className="
                    relative
                    w-full
                    min-w-0
                    flex
                    items-start
                    gap-3
                    sm:gap-4
                    mb-3
                    pr-20
                    sm:pr-24
                  "
                >

                  {/* ----------------------------------------- */}
                  {/* PLAYER IMAGE                              */}
                  {/* ----------------------------------------- */}

                  <button
                    type="button"
                    onClick={() =>
                      openImage(
                        player.image ||
                          "/placeholder.svg",
                        player.name
                      )
                    }
                    className="
                      group
                      relative
                      flex-shrink-0

                      w-16
                      h-16

                      sm:w-20
                      sm:h-20

                      md:w-24
                      md:h-24

                      overflow-hidden
                      rounded-lg
                      border
                      border-gray-200
                      bg-gray-50

                      cursor-zoom-in

                      focus:outline-none
                      focus:ring-2
                      focus:ring-blue-500
                    "
                    aria-label={`View ${player.name}'s photo`}
                  >
                    <img
                      src={
                        player.image ||
                        "/placeholder.svg"
                      }
                      alt={player.name}
                      className="
                        block
                        w-full
                        h-full
                        object-contain
                        rounded-lg
                        transition-transform
                        duration-200
                        group-hover:scale-105
                      "
                    />
                  </button>

                  {/* ----------------------------------------- */}
                  {/* PLAYER DETAILS                            */}
                  {/* ----------------------------------------- */}

                  <div
                    className="
                      flex-1
                      min-w-0
                      pt-0.5
                    "
                  >

                    <h3
                      className="
                        text-gray-900
                        font-semibold
                        text-sm
                        sm:text-base
                        leading-tight
                        break-words
                      "
                    >
                      {player.name}
                    </h3>

                    <div
                      className="
                        mt-1.5
                        flex
                        flex-wrap
                        gap-1
                        min-w-0
                      "
                    >

                      {getPositionChip(
                        player.position
                      )}

                      {player.city && (
                        <Badge
                          className="
                            bg-gray-100
                            text-gray-700
                            text-xs
                            whitespace-nowrap
                          "
                        >
                          {player.city}
                        </Badge>
                      )}

                      {player.previous_team && (
                        <Badge
                          className="
                            bg-purple-100
                            text-purple-700
                            text-xs
                            whitespace-normal
                            break-words
                          "
                        >
                          Previous-{" "}
                          {player.previous_team}
                        </Badge>
                      )}

                    </div>
                  </div>

                  {/* ----------------------------------------- */}
                  {/* STATUS                                     */}
                  {/* ----------------------------------------- */}

                  <div
                    className="
                      absolute
                      top-0
                      right-0
                      flex-shrink-0
                    "
                  >
                    {getStatusBadge(
                      player.status
                    )}
                  </div>

                </div>

                {/* ================================================= */}
                {/* PRICING                                          */}
                {/* ================================================= */}

                <div
                  className="
                    w-full
                    grid
                    grid-cols-2
                    gap-2
                    sm:gap-4
                    text-sm
                  "
                >

                  <div className="min-w-0 p-2 rounded-md bg-gray-50">
                    <p className="text-gray-500 text-xs">
                      Base Price
                    </p>

                    <p className="text-gray-900 font-semibold truncate">
                      {formatCurrency(
                        player.base_price
                      )}
                    </p>
                  </div>

                  <div className="min-w-0 p-2 rounded-md bg-gray-50">
                    <p className="text-gray-500 text-xs">
                      Final Price
                    </p>

                    <p className="text-gray-900 font-semibold truncate">
                      {player.current_price > 0
                        ? formatCurrency(
                            player.current_price
                          )
                        : "-"}
                    </p>
                  </div>

                </div>

              </CardContent>
            </Card>

          ))}

        </div>

        {/* =================================================== */}
        {/* EMPTY STATE                                        */}
        {/* =================================================== */}

        {filteredPlayers.length === 0 && (
          <Card className="w-full bg-white border border-gray-200 text-gray-400 text-sm">
            <CardContent className="p-6 text-center space-y-2">
              <Users className="mx-auto h-8 w-8 text-gray-300" />

              <p className="text-gray-500">
                No players found matching your criteria
              </p>
            </CardContent>
          </Card>
        )}

      </div>

      {/* ===================================================== */}
      {/* IMAGE LIGHTBOX                                       */}
      {/* ===================================================== */}

      {selectedImage && (
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
          onClick={closeImage}
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedPlayerName} photo`}
        >

          {/* Image wrapper */}
          <div
            className="
              relative
              flex
              items-center
              justify-center

              w-full
              h-full

              max-w-[1200px]
              max-h-[100vh]
            "
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <img
              src={selectedImage}
              alt={selectedPlayerName}
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

            {/* Close button */}
            <button
              type="button"
              onClick={closeImage}
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