"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Clock, DollarSign } from "lucide-react"

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
        return "bg-blue-600"
      case "Bowler":
        return "bg-red-600"
      case "All-rounder":
        return "bg-green-600"
      case "Wicket-keeper":
        return "bg-purple-600"
      default:
        return "bg-gray-600"
    }
  }

  return (
    <div className="space-y-4">
      {/* Sales Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <CardContent className="p-3 text-center">
            <DollarSign className="h-4 w-4 text-green-400 mx-auto mb-1" />
            <p className="text-gray-900 font-bold text-sm">₹{totalValue}</p>
            <p className="text-gray-400 text-xs">Total Sales</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <CardContent className="p-3 text-center">
            <TrendingUp className="h-4 w-4 text-blue-400 mx-auto mb-1" />
            <p className="text-gray-900 font-bold text-sm">₹{averagePrice}</p>
            <p className="text-gray-400 text-xs">Average</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <CardContent className="p-3 text-center">
            <Clock className="h-4 w-4 text-orange-400 mx-auto mb-1" />
            <p className="text-gray-900 font-bold text-sm">₹{highestSale}</p>
            <p className="text-gray-400 text-xs">Highest</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-3">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-white border border-gray-200 text-gray-90 text-sm h-9 rounded-md shadow-sm hover:border-gray-300 focus:ring-1 focus:ring-blue-500 focus:ring-offset-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 text-gray-90">
                <SelectItem
                  value="recent"
                  className="text-gray-900 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-900"
                >
                  Most Recent
                </SelectItem>
                <SelectItem
                  value="price-high"
                  className="text-gray-900 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-900"
                >
                  Highest Price
                </SelectItem>
                <SelectItem
                  value="price-low"
                  className="text-gray-900 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-900"
                >
                  Lowest Price
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="bg-white border border-gray-200 text-gray-900 text-sm h-9 rounded-md shadow-sm hover:border-gray-300 focus:ring-1 focus:ring-blue-500 focus:ring-offset-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 text-gray-90">
                <SelectItem
                  value="all"
                  className="text-gray-900 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-900"
                >
                  All Positions
                </SelectItem>
                {positions.map((position) => (
                  <SelectItem
                    key={position}
                    value={position}
                    className="text-gray-900 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-900"
                  >
                    {position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sales List */}
      <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-gray-900 text-lg">Recent Sales ({filteredAssignments.length})</CardTitle>
          <CardDescription className="text-gray-400 text-sm">Latest player transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredAssignments.map((assignment, index) => (
              <div key={assignment.id} className="p-3 bg-white/5 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium text-sm">{assignment.player?.name}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={`${getPositionColor(assignment.player?.position)} text-xs`}>
                          {assignment.player?.position}
                        </Badge>
                        <span className="text-gray-400 text-xs">→</span>
                        <span className="text-blue-400 text-xs font-medium">{assignment.team?.name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-900 font-bold">₹{assignment.final_price}</p>
                    <p className="text-gray-400 text-xs">{new Date(assignment.assigned_at).toLocaleDateString("en-GB")}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Base: ₹{assignment.player?.base_price}</span>
                  <span
                    className={`font-medium ${
                      assignment.final_price > assignment.player?.base_price ? "text-green-400" : "text-gray-400"
                    }`}
                  >
                    {assignment.final_price > assignment.player?.base_price ? "+" : ""}
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

      {filteredAssignments.length === 0 && (
        <Card className="bg-black/20 backdrop-blur-sm border-white/10">
          <CardContent className="p-6 text-center">
            <p className="text-gray-400">No sales found matching your criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
