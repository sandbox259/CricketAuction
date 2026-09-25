"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Gavel,
  Clock,
  TrendingUp,
  Trophy,
  History,
  MapPin,
  X,
  ZoomIn,
} from "lucide-react"

interface LiveAuctionTabProps {
  currentPlayer: any
  data: {
    teams: any[]
    players: any[]
    assignments: any[]
    auctionOverview: any
  }
}

export default function LiveAuctionTab({
  currentPlayer,
  data,
}: LiveAuctionTabProps) {
  const [showPlayerImage, setShowPlayerImage] = useState(false)

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value)

  const availablePlayers = data.players.filter(
    (p) => p.status === "available"
  )

  const soldPlayers =
    data.auctionOverview?.sold_players || 0

  const unsoldPlayers =
    data.auctionOverview?.unsold_players || 0

  const totalPlayers =
    data.auctionOverview?.total_players || 0

  const completedPlayers =
    soldPlayers + unsoldPlayers

  const auctionProgress =
    totalPlayers > 0
      ? (completedPlayers / totalPlayers) * 100
      : 0

  return (
    <div className="w-full space-y-3 sm:space-y-4">

      {/* =========================================================
          CURRENT PLAYER
          ========================================================= */}
      {currentPlayer ? (
        <Card
          className="
            w-full
            overflow-hidden
            rounded-2xl
            border
            border-gray-200
            bg-white
            shadow-sm
          "
        >
          {/* Header */}
          <CardHeader className="px-3 py-2.5 sm:px-5 sm:py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <Gavel className="h-5 w-5 shrink-0 text-blue-600" />

                <span className="text-sm font-semibold text-gray-900 sm:text-base">
                  Current Player
                </span>
              </div>

              <Badge
                className="
                  shrink-0
                  rounded-full
                  bg-red-500
                  px-2.5
                  py-1
                  text-[10px]
                  font-semibold
                  text-white
                  shadow-sm
                "
              >
                LIVE
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="px-3 pb-3 pt-1 sm:px-5 sm:pb-4">

            {/* ===================================================
                COMPACT PLAYER ROW
                =================================================== */}
            <div className="flex items-start gap-3 sm:gap-5">

              {/* =================================================
                  ROUND PLAYER PHOTO
                  ================================================= */}
              <div className="shrink-0">
                {currentPlayer.image ? (
                  <button
                    type="button"
                    onClick={() => setShowPlayerImage(true)}
                    aria-label={`View photo of ${currentPlayer.name}`}
                    className="
                      group
                      relative
                      flex
                      h-24
                      w-24
                      items-center
                      justify-center
                      overflow-hidden
                      rounded-full
                      border-2
                      border-blue-500
                      bg-gray-100
                      shadow-sm
                      outline-none
                      transition
                      hover:shadow-md
                      focus:ring-2
                      focus:ring-blue-400
                      focus:ring-offset-2
                      sm:h-28
                      sm:w-28
                      md:h-32
                      md:w-32
                    "
                  >
                    <img
                      src={currentPlayer.image}
                      alt={currentPlayer.name || "Player"}
                      className="
                        h-full
                        w-full
                        rounded-full
                        object-contain
                      "
                    />

                    {/* Desktop hover overlay */}
                    <div
                      className="
                        absolute
                        inset-0
                        hidden
                        items-center
                        justify-center
                        rounded-full
                        bg-black/45
                        text-white
                        sm:flex
                        sm:opacity-0
                        sm:transition-opacity
                        sm:duration-200
                        sm:group-hover:opacity-100
                      "
                    >
                      <div className="flex flex-col items-center gap-1">
                        <ZoomIn className="h-5 w-5" />
                        <span className="text-[10px] font-medium">
                          View
                        </span>
                      </div>
                    </div>

                    {/* Mobile tap indicator */}
                    <div
                      className="
                        absolute
                        bottom-0
                        left-1/2
                        flex
                        -translate-x-1/2
                        items-center
                        justify-center
                        rounded-full
                        bg-black/60
                        p-1
                        text-white
                        sm:hidden
                      "
                    >
                      <ZoomIn className="h-3 w-3" />
                    </div>
                  </button>
                ) : (
                  <div
                    className="
                      flex
                      h-24
                      w-24
                      items-center
                      justify-center
                      rounded-full
                      border-2
                      border-gray-200
                      bg-gray-100
                      text-xs
                      text-gray-400
                      sm:h-28
                      sm:w-28
                      md:h-32
                      md:w-32
                    "
                  >
                    No Image
                  </div>
                )}
              </div>

              {/* =================================================
                  PLAYER INFORMATION
                  ================================================= */}
              <div className="min-w-0 flex-1">

                {/* Name */}
                <h2
                  className="
                    break-words
                    whitespace-normal
                    text-xl
                    font-bold
                    leading-tight
                    text-gray-900
                    sm:text-2xl
                    md:text-3xl
                  "
                >
                  {currentPlayer.name}
                </h2>

                {/* Position */}
                {currentPlayer.position && (
                  <p
                    className="
                      mt-0.5
                      break-words
                      whitespace-normal
                      text-base
                      font-medium
                      text-amber-500
                      sm:text-lg
                    "
                  >
                    {currentPlayer.position}
                  </p>
                )}

                {/* Previous team + city */}
                {(currentPlayer.previous_team ||
                  currentPlayer.city) && (
                  <div
                    className="
                      mt-1.5
                      flex
                      flex-wrap
                      gap-1.5
                    "
                  >
                    {currentPlayer.previous_team && (
                      <Badge
                        variant="outline"
                        className="
                          h-auto
                          max-w-full
                          whitespace-normal
                          break-words
                          rounded-full
                          border-blue-200
                          bg-blue-50
                          px-2
                          py-0.5
                          text-[10px]
                          font-medium
                          leading-4
                          text-blue-700
                        "
                      >
                        {currentPlayer.previous_team}
                      </Badge>
                    )}

                    {currentPlayer.city && (
                      <Badge
                        variant="outline"
                        className="
                          h-auto
                          max-w-full
                          whitespace-normal
                          break-words
                          rounded-full
                          border-gray-200
                          bg-gray-100
                          px-2
                          py-0.5
                          text-[10px]
                          font-medium
                          leading-4
                          text-gray-700
                        "
                      >
                        <MapPin className="mr-1 h-3 w-3 shrink-0" />
                        {currentPlayer.city}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ===================================================
                ACHIEVEMENT
                =================================================== */}
            {currentPlayer.achievement && (
              <div
                className="
                  mt-3
                  rounded-lg
                  border
                  border-amber-200
                  bg-amber-50
                  px-2.5
                  py-2
                "
              >
                <div className="flex items-start gap-2">
                  <Trophy className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />

                  <p
                    className="
                      min-w-0
                      break-words
                      whitespace-normal
                      text-xs
                      leading-4.5
                      text-amber-800
                    "
                  >
                    {currentPlayer.achievement}
                  </p>
                </div>
              </div>
            )}

            {/* ===================================================
                BASE PRICE + STATUS
                =================================================== */}
            <div
              className="
                mt-3
                flex
                items-center
                justify-between
                gap-3
                border-t
                border-gray-100
                pt-2.5
              "
            >
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
                  Base Price
                </p>

                <p className="text-lg font-bold text-gray-900 sm:text-xl">
                  {formatCurrency(
                    Number(currentPlayer.base_price || 0)
                  )}
                </p>
              </div>

              <p className="shrink-0 text-right text-[11px] italic text-gray-500">
                Bidding in progress...
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* =======================================================
           NO ACTIVE AUCTION
           ======================================================= */
        <Card className="rounded-2xl border-gray-200 bg-white shadow-sm">
          <CardContent className="space-y-2 p-6 text-center">
            <Clock className="mx-auto mb-2 h-12 w-12 text-gray-400" />

            <h3 className="font-semibold text-gray-900">
              No Active Auction
            </h3>

            <p className="text-sm text-gray-500">
              Waiting for the next player...
            </p>
          </CardContent>
        </Card>
      )}

      {/* =========================================================
          AUCTION PROGRESS
          ========================================================= */}
      <Card className="w-full rounded-2xl border-gray-200 bg-white shadow-sm">
        <CardHeader className="px-3 pb-1.5 pt-2.5 sm:px-4">
          <CardTitle className="flex items-center text-sm font-semibold text-gray-900 sm:text-base">
            <TrendingUp className="mr-2 h-4 w-4 text-amber-500" />
            Auction Progress
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-2.5 px-3 pb-3 pt-1 sm:px-4">

          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] sm:text-xs">
              <span className="text-gray-600">
                Players Completed
              </span>

              <span className="font-semibold text-gray-900">
                {completedPlayers} / {totalPlayers}
              </span>
            </div>

            <Progress
              value={auctionProgress}
              className="h-1.5 rounded-full"
            />
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-center">
            <div className="rounded-lg bg-emerald-50 px-2 py-1.5">
              <p className="text-sm font-bold text-emerald-600">
                {soldPlayers}
              </p>

              <p className="text-[9px] text-gray-600">
                Sold
              </p>
            </div>

            <div className="rounded-lg bg-red-50 px-2 py-1.5">
              <p className="text-sm font-bold text-red-600">
                {unsoldPlayers}
              </p>

              <p className="text-[9px] text-gray-600">
                Unsold
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 px-2 py-1.5">
              <p className="text-sm font-bold text-blue-600">
                {availablePlayers.length}
              </p>

              <p className="text-[9px] text-gray-600">
                Remaining
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* =========================================================
          RECENT SALES
          ========================================================= */}
      <Card className="w-full rounded-2xl border-gray-200 bg-white shadow-sm">
        <CardHeader className="px-3 pb-1.5 pt-2.5 sm:px-4">
          <CardTitle className="flex items-center text-sm font-semibold text-gray-900 sm:text-base">
            <History className="mr-2 h-4 w-4 text-blue-500" />
            Recent Sales
          </CardTitle>
        </CardHeader>

        <CardContent className="px-3 pb-3 pt-1 sm:px-4">
          <div className="space-y-2">

            {data.assignments
              .slice(0, 3)
              .map((assignment: any) => (
                <div
                  key={assignment.id}
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    rounded-lg
                    bg-gray-50
                    p-2
                  "
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />

                    <div className="min-w-0">
                      <p className="break-words whitespace-normal text-xs font-medium text-gray-900">
                        {assignment.player?.name}
                      </p>

                      <p className="break-words whitespace-normal text-[10px] text-gray-600">
                        {assignment.team?.name}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-xs font-semibold text-gray-900">
                      {formatCurrency(
                        assignment.final_price
                      )}
                    </p>

                    <p className="text-[10px] text-gray-500">
                      {assignment.assigned_at
                        ? new Date(
                            assignment.assigned_at
                          )
                            .toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            })
                            .replace("AM", "am")
                            .replace("PM", "pm")
                        : "-"}
                    </p>
                  </div>
                </div>
              ))}

            {data.assignments.length === 0 && (
              <div className="py-5 text-center">
                <p className="text-xs text-gray-500">
                  No recent sales yet.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* =========================================================
          FULLSCREEN PLAYER PHOTO
          ========================================================= */}
      {showPlayerImage && currentPlayer?.image && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-black/80
            p-4
            backdrop-blur-sm
          "
          role="dialog"
          aria-modal="true"
          aria-label={`Photo of ${currentPlayer.name}`}
          onClick={() => setShowPlayerImage(false)}
        >
          <div
            className="
              relative
              flex
              max-h-[90vh]
              max-w-[94vw]
              items-center
              justify-center
            "
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={currentPlayer.image}
              alt={currentPlayer.name}
              className="
                max-h-[85vh]
                max-w-[90vw]
                rounded-xl
                object-contain
                shadow-2xl
              "
            />

            {/* Close */}
            <button
              type="button"
              aria-label="Close player image"
              onClick={() => setShowPlayerImage(false)}
              className="
                absolute
                right-2
                top-2
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                bg-black/70
                text-white
                shadow-lg
                transition-colors
                hover:bg-black/90
                focus:outline-none
                focus:ring-2
                focus:ring-white
              "
            >
              <X className="h-5 w-5" />
            </button>

            {/* Name */}
            <div
              className="
                absolute
                bottom-2
                left-2
                right-2
                rounded-lg
                bg-black/60
                px-3
                py-2
                text-center
                text-sm
                font-medium
                text-white
                backdrop-blur-sm
              "
            >
              {currentPlayer.name}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}