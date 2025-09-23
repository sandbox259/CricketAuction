"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Search } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { toast } from "sonner"

interface PlayersTabProps {
  initialPlayers: any[]
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)

export default function PlayersTab({ initialPlayers }: PlayersTabProps) {
  const [players, setPlayers] = useState(initialPlayers)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [positionFilter, setPositionFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    base_price: "",
  })

  const filteredPlayers = players.filter((player) => {
    const matchesSearch =
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.position.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || player.status === statusFilter
    const matchesPosition = positionFilter === "all" || player.position === positionFilter
    return matchesSearch && matchesStatus && matchesPosition
  })

  const positions = [...new Set(players.map((p) => p.position))]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sold":
        return <Badge className="bg-green-600 text-xs">Sold</Badge>
      case "unsold":
        return <Badge className="bg-red-600 text-xs">Unsold</Badge>
      default:
        return <Badge className="bg-blue-600 text-xs">Available</Badge>
    }
  }

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase
        .from("players")
        .insert({
          name: formData.name,
          position: formData.position,
          base_price: Number.parseFloat(formData.base_price),
        })
        .select()
        .single()
      if (error) throw error
      setPlayers([...players, data])
      setFormData({ name: "", position: "", base_price: "" })
      setIsAddDialogOpen(false)
      toast.success("Player added successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to add player")
    }
  }

  const handleEditPlayer = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase
        .from("players")
        .update({
          name: formData.name,
          position: formData.position,
          base_price: Number.parseFloat(formData.base_price),
        })
        .eq("id", editingPlayer.id)
        .select()
        .single()
      if (error) throw error
      setPlayers(players.map((p) => (p.id === editingPlayer.id ? data : p)))
      setEditingPlayer(null)
      setFormData({ name: "", position: "", base_price: "" })
      toast.success("Player updated successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to update player")
    }
  }

  const openEditDialog = (player: any) => {
    setEditingPlayer(player)
    setFormData({
      name: player.name,
      position: player.position,
      base_price: player.base_price.toString(),
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Players Management</h2>
          <p className="text-gray-500 text-sm">Manage cricket players in the auction</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Add Player
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white rounded-xl border p-6 space-y-4">
            <DialogHeader>
              <DialogTitle className="text-gray-900 text-lg font-semibold">Add New Player</DialogTitle>
              <DialogDescription className="text-gray-500 text-sm">
                Add a new cricket player to the auction pool
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddPlayer} className="space-y-4">
              <div className="space-y-1">
                <Label className="text-gray-900 text-sm">Player Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white border border-gray-200 text-gray-900 text-sm"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-gray-900 text-sm">Position</Label>
                <Select
                  value={formData.position}
                  onValueChange={(value) => setFormData({ ...formData, position: value })}
                >
                  <SelectTrigger className="w-full bg-white border border-gray-200 text-gray-900 text-sm h-9 rounded-md shadow-sm hover:border-gray-300 focus:ring-1 focus:ring-blue-500 focus:ring-offset-1">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg p-1 max-h-60 overflow-y-auto">
                    <SelectItem value="Batsman" className="text-gray-900 hover:bg-blue-50 hover:text-gray-900 rounded-md px-2 py-1">Batsman</SelectItem>
                    <SelectItem value="Bowler" className="text-gray-900 hover:bg-blue-50 hover:text-gray-900 rounded-md px-2 py-1">Bowler</SelectItem>
                    <SelectItem value="All-rounder" className="text-gray-900 hover:bg-blue-50 hover:text-gray-900 rounded-md px-2 py-1">All-rounder</SelectItem>
                    <SelectItem value="Wicket-keeper" className="text-gray-900 hover:bg-blue-50 hover:text-gray-900 rounded-md px-2 py-1">Wicket-keeper</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-gray-900 text-sm">Base Price (₹)</Label>
                <Input
                  type="number"
                  value={formData.base_price}
                  onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                  className="w-full bg-white border border-gray-200 text-gray-900 text-sm"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700">
                Add Player
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border border-gray-200 text-gray-900 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full bg-white border border-gray-200 text-gray-900 text-sm h-9 rounded-md shadow-sm hover:border-gray-300 focus:ring-1 focus:ring-blue-500 focus:ring-offset-1">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg p-1 max-h-60 overflow-y-auto">
                <SelectItem value="all" className="text-gray-900 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-900 rounded-md px-2 py-1">All Status</SelectItem>
                <SelectItem value="available" className="text-gray-900 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-900 rounded-md px-2 py-1">Available</SelectItem>
                <SelectItem value="sold" className="text-gray-900 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-900 rounded-md px-2 py-1">Sold</SelectItem>
                <SelectItem value="unsold" className="text-gray-900 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-900 rounded-md px-2 py-1">Unsold</SelectItem>
              </SelectContent>
            </Select>

            {/* Position Filter */}
            <Select value={positionFilter} onValueChange={setPositionFilter}>
              <SelectTrigger className="w-full bg-white border border-gray-200 text-gray-900 text-sm h-9 rounded-md shadow-sm hover:border-gray-300 focus:ring-1 focus:ring-blue-500 focus:ring-offset-1">
                <SelectValue placeholder="All Positions" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg p-1 max-h-60 overflow-y-auto">
                <SelectItem value="all" className="text-gray-900 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-900 rounded-md px-2 py-1">All Positions</SelectItem>
                {positions.map((position) => (
                  <SelectItem key={position} value={position} className="text-gray-900 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-900 rounded-md px-2 py-1">
                    {position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Players Table */}
      <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Players ({filteredPlayers.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Base Price</TableHead>
                <TableHead>Current Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlayers.map((player) => (
                <TableRow key={player.id} className="hover:bg-gray-50 border-b border-gray-100">
                  <TableCell className="font-medium text-gray-900">{player.name}</TableCell>
                  <TableCell className="text-gray-500">{player.position}</TableCell>
                  <TableCell className="text-gray-500">{formatCurrency(player.base_price)}</TableCell>
                  <TableCell className="text-gray-500">
                    {player.current_price > 0 ? `${formatCurrency(player.current_price)}` : "-"}
                  </TableCell>
                  <TableCell>{getStatusBadge(player.status)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:bg-gray-50"
                      onClick={() => openEditDialog(player)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingPlayer} onOpenChange={() => setEditingPlayer(null)}>
        <DialogContent className="bg-white rounded-xl border p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-gray-900 text-lg font-semibold">Edit Player</DialogTitle>
            <DialogDescription className="text-gray-500 text-sm">Update player information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditPlayer} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-gray-900 text-sm">Player Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white border border-gray-200 text-gray-900 text-sm"
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-gray-900 text-sm">Position</Label>
              <Select
                value={formData.position}
                onValueChange={(value) => setFormData({ ...formData, position: value })}
              >
                <SelectTrigger className="w-full bg-white border border-gray-200 text-gray-900 text-sm h-9 rounded-md shadow-sm hover:border-gray-300 focus:ring-1 focus:ring-blue-500 focus:ring-offset-1">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg p-1 max-h-60 overflow-y-auto">
                  <SelectItem value="Batsman" className="text-gray-900 hover:bg-blue-50 hover:text-gray-900 rounded-md px-2 py-1">Batsman</SelectItem>
                  <SelectItem value="Bowler" className="text-gray-900 hover:bg-blue-50 hover:text-gray-900 rounded-md px-2 py-1">Bowler</SelectItem>
                  <SelectItem value="All-rounder" className="text-gray-900 hover:bg-blue-50 hover:text-gray-900 rounded-md px-2 py-1">All-rounder</SelectItem>
                  <SelectItem value="Wicket-keeper" className="text-gray-900 hover:bg-blue-50 hover:text-gray-900 rounded-md px-2 py-1">Wicket-keeper</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-gray-900 text-sm">Base Price (₹)</Label>
              <Input
                type="number"
                value={formData.base_price}
                onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                className="w-full bg-white border border-gray-200 text-gray-900 text-sm"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700">
              Update Player
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
