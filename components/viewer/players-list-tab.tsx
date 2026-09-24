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

export default function PlayersListTab({ players }: PlayersListTabProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [positionFilter, setPositionFilter] = useState("all")
  const [cityFilter, setCityFilter] = useState("all")

  // Lightbox state
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedPlayerName, setSelectedPlayerName] = useState<string>("")

  const filteredPlayers = players.filter((player) => {
    const matchesSearch =
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.position.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === "all" || player.status === statusFilter

    const matchesPosition =
      positionFilter === "all" || player.position === positionFilter

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
          <Badge className="bg-green-100 text-green-700 text-xs whitespace-nowrap flex-shrink-0">
            Sold
          </Badge>
        )

      case "unsold":
        return (
          <Badge className="bg-red-100 text-red-700 text-xs whitespace-nowrap flex-shrink-0">
            Unsold
          </Badge>
        )

      default:
        return (
          <Badge className="bg-blue-100 text-blue-700 text-xs whitespace-nowrap flex-shrink-0">
            Available
          </Badge>
        )
    }
  }

  const getPositionChip = (position: string) => {
    switch (position) {
      case "Batsman":
        return (
          <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs">
            {position}
          </span>
        )

      case "Bowler":
        return (
          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs">
            {position}
          </span>
        )

      case "All Rounder":
        return (
          <span className="px-2 py-0.5 rounded-full bg-lime-100 text-lime-700 text-xs">
            {position}
          </span>
        )

      case "Wicket-keeper":
        return (
          <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs">
            {position}
          </span>
        )

      default:
        return (
          <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 text-xs">
            {position}
          </span>
        )
    }
  }

  const positions = [...new Set(players.map((p) => p.position))]

  // Open image lightbox
  const openImage = (image: string, playerName: string) => {
    setSelectedImage(image)
    setSelectedPlayerName(playerName)
  }

  // Close image lightbox
  const closeImage = () => {
    setSelectedImage(null)
    setSelectedPlayerName("")
  }

  // Allow Escape key to close lightbox
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeImage()
      }
    }

    if (selectedImage) {
      document.addEventListener("keydown", handleKeyDown)

      // Prevent background page from scrolling while image is open
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [selectedImage])

  return (
    <>
      <div className="space-y-4">

        {/* Search and Filters */}
        <Card className="bg-white border border-gray-200 rounded-xl shadow-md">
          <CardContent className="p-4 space-y-3">

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />

              <Input
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-gray-200 text-gray-900 text-sm rounded-full focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Responsive Filters */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">

              {/* Status Filter */}
              <div className="min-w-0">
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="bg-white border border-gray-200 text-gray-900 text-xs sm:text-sm h-8 sm:h-9 rounded-md shadow-sm hover:border-gray-300 focus:ring-2 focus:ring-blue-500 w-full">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>

                  <SelectContent className="bg-white border border-gray-200 text-gray-900">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="unsold">Unsold</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Position Filter */}
              <div className="min-w-0">
                <Select
                  value={positionFilter}
                  onValueChange={setPositionFilter}
                >
                  <SelectTrigger className="bg-white border border-gray-200 text-gray-900 text-xs sm:text-sm h-8 sm:h-9 rounded-md shadow-sm hover:border-gray-300 focus:ring-2 focus:ring-blue-500 w-full">
                    <SelectValue placeholder="Position" />
                  </SelectTrigger>

                  <SelectContent className="bg-white border border-gray-200 text-gray-900">
                    <SelectItem value="all">All Positions</SelectItem>

                    {positions.map((position) => (
                      <SelectItem key={position} value={position}>
                        {position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* City Filter */}
              <div className="min-w-0">
                <Select
                  value={cityFilter}
                  onValueChange={setCityFilter}
                >
                  <SelectTrigger className="bg-white border border-gray-200 text-gray-900 text-xs sm:text-sm h-8 sm:h-9 rounded-md shadow-sm hover:border-gray-300 focus:ring-2 focus:ring-blue-500 w-full">
                    <SelectValue placeholder="City" />
                  </SelectTrigger>

                  <SelectContent className="bg-white border border-gray-200 text-gray-900">
                    <SelectItem value="all">All Cities</SelectItem>
                    <SelectItem value="Mumbai">Mumbai</SelectItem>
                    <SelectItem value="Pune">Pune</SelectItem>
                    <SelectItem value="Banglore">Bangalore</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Players Count */}
        <div className="flex items-center justify-between px-1">
          <p className="text-gray-500 text-sm">
            {filteredPlayers.length} player
            {filteredPlayers.length !== 1 ? "s" : ""} found
          </p>

          <Filter className="h-4 w-4 text-gray-400" />
        </div>

        {/* Players List */}
        <div className="space-y-3">

          {filteredPlayers.map((player) => (
            <Card
              key={player.id}
              className="bg-gradient-to-r from-white via-gray-50 to-white border border-gray-200 text-sm transition-all hover:shadow-md hover:-translate-y-0.5 rounded-xl"
            >
              <CardContent className="p-4">

                <div className="flex items-start justify-between mb-3">

                  <div className="flex items-start space-x-4 flex-1 min-w-0">

                    {/* Player Image */}
                    <button
                      type="button"
                      onClick={() =>
                        openImage(
                          player.image || "/placeholder.svg",
                          player.name
                        )
                      }
                      className="
                        group
                        relative
                        w-20 h-20
                        sm:w-24 sm:h-24
                        flex-shrink-0
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
                        src={player.image || "/placeholder.svg"}
                        alt={player.name}
                        className="
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

                    {/* Player Information */}
                    <div className="flex-1 min-w-0 pt-0.5">

                      <h3 className="text-gray-900 font-semibold">
                        {player.name}
                      </h3>

                      <div className="mt-1 flex flex-wrap gap-1">

                        {getPositionChip(player.position)}

                        {player.city && (
                          <Badge className="bg-gray-100 text-gray-700 text-xs">
                            {player.city}
                          </Badge>
                        )}

                        {player.previous_team && (
                          <Badge className="bg-purple-100 text-purple-700 text-xs whitespace-nowrap">
                            Previous- {player.previous_team}
                          </Badge>
                        )}

                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex-shrink-0 ml-2">
                    {getStatusBadge(player.status)}
                  </div>

                </div>

                {/* Pricing */}
                <div className="grid grid-cols-2 gap-4 text-sm">

                  <div className="p-2 rounded-md bg-gray-50">
                    <p className="text-gray-500 text-xs">
                      Base Price
                    </p>

                    <p className="text-gray-900 font-semibold">
                      {formatCurrency(player.base_price)}
                    </p>
                  </div>

                  <div className="p-2 rounded-md bg-gray-50">
                    <p className="text-gray-500 text-xs">
                      Final Price
                    </p>

                    <p className="text-gray-900 font-semibold">
                      {player.current_price > 0
                        ? formatCurrency(player.current_price)
                        : "-"}
                    </p>
                  </div>

                </div>

              </CardContent>
            </Card>
          ))}

        </div>

        {/* Empty State */}
        {filteredPlayers.length === 0 && (
          <Card className="bg-white border border-gray-200 text-gray-400 text-sm">
            <CardContent className="p-6 text-center space-y-2">
              <Users className="mx-auto h-8 w-8 text-gray-300" />

              <p className="text-gray-500">
                No players found matching your criteria
              </p>
            </CardContent>
          </Card>
        )}

      </div>

      {/* ========================================================= */}
      {/* IMAGE LIGHTBOX */}
      {/* ========================================================= */}

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
            p-4
            sm:p-6
          "
          onClick={closeImage}
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedPlayerName} photo`}
        >

          {/* Image Container */}
          <div
            className="
              relative
              flex
              items-center
              justify-center
              max-w-[95vw]
              max-h-[90vh]
            "
            onClick={(e) => e.stopPropagation()}
          >

            <img
              src={selectedImage}
              alt={selectedPlayerName}
              className="
                max-w-[95vw]
                max-h-[85vh]
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
              onClick={closeImage}
              className="
                absolute
                -top-3
                -right-3
                sm:-top-4
                sm:-right-4
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