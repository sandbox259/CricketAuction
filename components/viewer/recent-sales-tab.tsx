"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Clock, DollarSign, ArrowUp, ArrowDown, Crown, Filter } from "lucide-react"

// 🔹 Utility for INR formatting with commas
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)

interface RecentSalesTabProps {
  assignments: any[]
}

export default function RecentSalesTab({ assignments }: RecentSalesTabProps) {
  const [sortBy, setSortBy] = useState("recent")
  const [filterBy, setFilterBy] = useState("all")

  const sortedAssignments = [...assignments].sort((a, b) => {
    switch (sortBy) {
      case "price-high":
        return b.final_price - a.final_price
      case "price-low":
        return a.final_price - b.final_price
      case "recent":
      default:
        return new Date(b.assigned_at).getTime() - new Date(a.assigned_at).getTime()
    }
  })

  const filteredAssignments = sortedAssignments.filter((assignment) => {
    if (filterBy === "all") return true
    return assignment.player?.position === filterBy
  })

  const totalValue = assignments.reduce((sum, assignment) => sum + assignment.final_price, 0)
  const averagePrice = assignments.length > 0 ? totalValue / assignments.length : 0
  const highestSale = assignments.reduce(
    (max, assignment) => (assignment.final_price > max ? assignment.final_price : max),
    0,
  )

  const positions = [...new Set(assignments.map((a) => a.player?.position).filter(Boolean))]

  const getPositionColor = (position: string) => {
    switch (position) {
      case "Batsman":
        return "bg-gradient-to-r from-blue-500 to-blue-700"
      case "Bowler":
        return "bg-gradient-to-r from-red-500 to-red-700"
      case "All Rounder":
        return "bg-gradient-to-r from-green-500 to-green-700"
      case "Wicket Keeper":
        return "bg-gradient-to-r from-purple-500 to-purple-700"
      default:
        return "bg-gray-600"
    }
  }

  return (
    <div className="space-y-4">
      {/* 🔹 Sales Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-[#102238] border border-white/10 rounded-xl shadow-sm hover:shadow-md transition">
          <CardContent className="p-2 sm:p-3 text-center">
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mx-auto mb-1" />
            <p className="text-slate-100 font-bold text-xs sm:text-sm md:text-base">
              {formatCurrency(totalValue)}
            </p>
            <p className="text-slate-500 text-[10px] sm:text-xs">Total Sales</p>
          </CardContent>
        </Card>

        <Card className="bg-[#102238] border border-white/10 rounded-xl shadow-sm hover:shadow-md transition">
          <CardContent className="p-2 sm:p-3 text-center">
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 mx-auto mb-1" />
            <p className="text-slate-100 font-bold text-xs sm:text-sm md:text-base">
              {formatCurrency(averagePrice)}
            </p>
            <p className="text-slate-500 text-[10px] sm:text-xs">Average</p>
          </CardContent>
        </Card>

        <Card className="bg-[#102238] border border-white/10 rounded-xl shadow-sm hover:shadow-md transition">
          <CardContent className="p-2 sm:p-3 text-center">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500 mx-auto mb-1" />
            <p className="text-slate-100 font-bold text-xs sm:text-sm md:text-base">
              {formatCurrency(highestSale)}
            </p>
            <p className="text-slate-500 text-[10px] sm:text-xs">Highest</p>
          </CardContent>
        </Card>
      </div>

      {/* 🔹 Filters */}
      <Card className="bg-[#102238] border border-white/10 rounded-xl shadow-sm">
        <CardContent className="p-3 sm:p-4">
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-[#102238] border border-white/10 text-slate-100 text-xs sm:text-sm h-8 sm:h-9 rounded-md shadow-sm hover:border-gray-300 focus:ring-1 focus:ring-blue-500 focus:ring-offset-1">
                <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-slate-500" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#102238] border border-white/10 text-slate-100">
                <SelectItem value="recent" className="text-slate-100">Most Recent</SelectItem>
                <SelectItem value="price-high" className="text-slate-100">Highest Price</SelectItem>
                <SelectItem value="price-low" className="text-slate-100">Lowest Price</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="bg-[#102238] border border-white/10 text-slate-100 text-xs sm:text-sm h-8 sm:h-9 rounded-md shadow-sm hover:border-gray-300 focus:ring-1 focus:ring-blue-500 focus:ring-offset-1">
                <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-slate-500" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#102238] border border-white/10 text-slate-100">
                <SelectItem value="all" className="text-slate-100">All Positions</SelectItem>
                {positions.map((position) => (
                  <SelectItem key={position} value={position} className="text-slate-100">
                    {position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 🔹 Sales List */}
      <Card className="bg-[#102238] border border-white/10 rounded-xl shadow-sm">
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-slate-100 text-sm sm:text-base md:text-lg">
            Recent Sales ({filteredAssignments.length})
          </CardTitle>
          <CardDescription className="text-slate-500 text-xs sm:text-sm">
            Latest player transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 sm:space-y-3">
            {filteredAssignments.map((assignment, index) => (
              <div
                key={assignment.id}
                className={`p-2 sm:p-3 rounded-lg border transition hover:shadow-md hover:scale-[1.01] ${
                  assignment.final_price === highestSale ? "border-yellow-400" : "border-white/10"
                }`}
              >
                <div className="flex items-start justify-between mb-2 gap-2">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-orange-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-[10px] sm:text-xs font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-slate-100 font-medium text-xs sm:text-sm flex items-center gap-1">
                        {assignment.player?.name}
                        {assignment.final_price === highestSale && <Crown className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />}
                      </p>
                      <div className="flex items-center space-x-1 sm:space-x-2 mt-1">
                        <Badge className={`${getPositionColor(assignment.player?.position)} text-[10px] sm:text-xs`}>
                          {assignment.player?.position}
                        </Badge>
                        <span className="text-slate-500 text-[10px] sm:text-xs">→</span>
                        <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-100 text-blue-600 text-[8px] sm:text-[10px] flex items-center justify-center">
                          {assignment.team?.name?.[0]}
                        </span>
                        <span className="text-blue-500 text-[10px] sm:text-xs font-medium">
                          {assignment.team?.name}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-100 font-bold text-xs sm:text-sm md:text-base">
                      {formatCurrency(assignment.final_price)}
                    </p>
                    <p className="text-slate-500 text-[10px] sm:text-xs">
                      {new Date(assignment.assigned_at).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                </div>

                {/* 🔹 Trend Indicator */}
                <div className="flex items-center justify-between text-[10px] sm:text-xs">
                  <span className="text-slate-500">
                    Base: {formatCurrency(assignment.player?.base_price)}
                  </span>
                  <span
                    className={`font-medium flex items-center gap-1 ${
                      assignment.final_price > assignment.player?.base_price ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {assignment.final_price > assignment.player?.base_price ? (
                      <ArrowUp className="h-3 w-3 sm:h-4 sm:w-4" />
                    ) : (
                      <ArrowDown className="h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                    {(
                      ((assignment.final_price - assignment.player?.base_price) / assignment.player?.base_price) *
                      100
                    ).toFixed(0)}
                    %
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 🔹 Empty State */}
      {filteredAssignments.length === 0 && (
        <Card className="bg-[#102238] border border-white/10 shadow-sm">
          <CardContent className="p-4 sm:p-6 text-center">
            <Filter className="h-5 w-5 sm:h-6 sm:w-6 text-slate-500 mx-auto mb-2" />
            <p className="text-slate-500 text-xs sm:text-sm">
              No sales found matching your criteria
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
