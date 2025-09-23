"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Users, Shield, Edit } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { toast } from "sonner"

interface UsersTabProps {
  initialUsers: any[]
  teams: any[]
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)

export default function UsersTab({ initialUsers, teams }: UsersTabProps) {
  const [users, setUsers] = useState(initialUsers)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [selectedRole, setSelectedRole] = useState("viewer")
  const [selectedTeam, setSelectedTeam] = useState("")

  const handleUpdateUser = async () => {
    if (!editingUser) return

    try {
      const { error } = await supabase
        .from("users")
        .update({
          role: selectedRole,
          team_id: selectedTeam ? Number.parseInt(selectedTeam) : null,
        })
        .eq("id", editingUser.id)

      if (error) throw error

      setUsers(
        users.map((user) =>
          user.id === editingUser.id
            ? { ...user, role: selectedRole, team_id: selectedTeam ? Number.parseInt(selectedTeam) : null }
            : user,
        ),
      )

      setEditingUser(null)
      setSelectedRole("viewer")
      setSelectedTeam("")
      toast.success("User updated successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to update user")
    }
  }

  const openEditDialog = (user: any) => {
    setEditingUser(user)
    setSelectedRole(user.role)
    setSelectedTeam(user.team_id?.toString() || "")
  }

  const getRoleBadge = (role: string) => {
    return role === "admin" ? (
      <Badge className="bg-red-600">Admin</Badge>
    ) : (
      <Badge className="bg-blue-600">Viewer</Badge>
    )
  }

  const getTeamName = (teamId: number) => {
    const team = teams.find((t) => t.id === teamId)
    return team ? team.name : "No Team"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">Manage user roles and team assignments</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">Total Users</CardTitle>
            <Users className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{users.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">Admins</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{users.filter((u) => u.role === "admin").length}</div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-900">Viewers</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{users.filter((u) => u.role === "viewer").length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">All Users</CardTitle>
          <CardDescription className="text-gray-600">Manage user permissions and team assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200">
                <TableHead className="text-gray-700">Phone</TableHead>
                <TableHead className="text-gray-700">Role</TableHead>
                <TableHead className="text-gray-700">Team</TableHead>
                <TableHead className="text-gray-700">Joined</TableHead>
                <TableHead className="text-gray-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="border-gray-200 hover:bg-gray-50">
                  <TableCell className="text-gray-900 font-medium">{user.phone}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell className="text-gray-600">
                    {user.team_id ? getTeamName(user.team_id) : "No Team"}
                  </TableCell>
                  <TableCell className="text-gray-600">{new Date(user.created_at).toLocaleDateString("en-GB")}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(user)}
                          className="text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white border-gray-200">
                        <DialogHeader>
                          <DialogTitle className="text-gray-900">Edit User</DialogTitle>
                          <DialogDescription className="text-gray-600">
                            Update user role and team assignment
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-gray-900 text-sm font-medium">Phone Number</label>
                            <p className="text-gray-600 mt-1">{editingUser?.phone}</p>
                          </div>

                          <div>
                            <label className="text-gray-900 text-sm font-medium">Role</label>
                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                              <SelectTrigger className="bg-white border-gray-200 text-gray-900 mt-1">
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="viewer">Viewer</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="text-gray-900 text-sm font-medium">Team Assignment</label>
                            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                              <SelectTrigger className="bg-white border-gray-200 text-gray-900 mt-1">
                                <SelectValue placeholder="Select team (optional)" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">No Team</SelectItem>
                                {teams.map((team) => (
                                  <SelectItem key={team.id} value={team.id.toString()}>
                                    {team.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <Button
                            onClick={handleUpdateUser}
                            className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                          >
                            Update User
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
