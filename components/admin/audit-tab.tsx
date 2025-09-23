"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

export default function AuditTab() {
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTable, setSelectedTable] = useState("all")

  const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)

  useEffect(() => {
    const fetchAuditData = async () => {
      try {
        // Fetch audit logs
        const { data: logs } = await supabase
          .from("audit_log")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50)

        // Fetch ledger entries
        const { data: ledger } = await supabase
          .from("ledger")
          .select(`
            *,
            team:teams(name),
            player:players(name)
          `)
          .order("created_at", { ascending: false })
          .limit(50)

        setAuditLogs(logs || [])
        setLedgerEntries(ledger || [])
      } catch (error) {
        console.error("Error fetching audit data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAuditData()
  }, [])

  const filteredLogs = selectedTable === "all" ? auditLogs : auditLogs.filter((log) => log.table_name === selectedTable)

  const getActionBadge = (action: string) => {
    switch (action) {
      case "INSERT":
        return <Badge className="bg-green-600">Created</Badge>
      case "UPDATE":
        return <Badge className="bg-blue-600">Updated</Badge>
      case "DELETE":
        return <Badge className="bg-red-600">Deleted</Badge>
      default:
        return <Badge variant="outline">{action}</Badge>
    }
  }

  const getTransactionBadge = (type: string) => {
    return type === "debit" ? (
      <Badge className="bg-red-600">Debit</Badge>
    ) : (
      <Badge className="bg-green-600">Credit</Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-900">Loading audit data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Audit & Transactions</h2>
        <p className="text-gray-600">Monitor system changes and financial transactions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">Audit Entries</CardTitle>
            <FileText className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{auditLogs.length}</div>
            <p className="text-xs text-gray-600 mt-2">Recent system changes</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">Transactions</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{ledgerEntries.length}</div>
            <p className="text-xs text-gray-600 mt-2">Financial transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Transactions */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Financial Transactions</CardTitle>
          <CardDescription className="text-gray-600">All team budget transactions and player purchases</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200">
                <TableHead className="text-gray-700">Date</TableHead>
                <TableHead className="text-gray-700">Team</TableHead>
                <TableHead className="text-gray-700">Player</TableHead>
                <TableHead className="text-gray-700">Type</TableHead>
                <TableHead className="text-gray-700">Amount</TableHead>
                <TableHead className="text-gray-700">Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ledgerEntries.map((entry) => (
                <TableRow key={entry.id} className="border-gray-200 hover:bg-gray-50">
                  <TableCell className="text-gray-600">{new Date(entry.created_at).toLocaleString()}</TableCell>
                  <TableCell className="text-gray-900 font-medium">{entry.team?.name}</TableCell>
                  <TableCell className="text-gray-600">{entry.player?.name || "-"}</TableCell>
                  <TableCell>{getTransactionBadge(entry.transaction_type)}</TableCell>
                  <TableCell className="text-gray-900 font-medium">{formatCurrency(entry.amount)}</TableCell>
                  <TableCell className="text-gray-600">{entry.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Audit Logs */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gray-900">System Audit Logs</CardTitle>
              <CardDescription className="text-gray-600">Track all system changes and modifications</CardDescription>
            </div>
            <Select value={selectedTable} onValueChange={setSelectedTable}>
              <SelectTrigger className="w-48 bg-white border-gray-200 text-gray-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tables</SelectItem>
                <SelectItem value="players">Players</SelectItem>
                <SelectItem value="teams">Teams</SelectItem>
                <SelectItem value="assignments">Assignments</SelectItem>
                <SelectItem value="users">Users</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200">
                <TableHead className="text-gray-700">Timestamp</TableHead>
                <TableHead className="text-gray-700">Table</TableHead>
                <TableHead className="text-gray-700">Action</TableHead>
                <TableHead className="text-gray-700">Record ID</TableHead>
                <TableHead className="text-gray-700">User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id} className="border-gray-200 hover:bg-gray-50">
                  <TableCell className="text-gray-600">{new Date(log.created_at).toLocaleString()}</TableCell>
                  <TableCell className="text-gray-900 font-medium">{log.table_name}</TableCell>
                  <TableCell>{getActionBadge(log.action)}</TableCell>
                  <TableCell className="text-gray-600">{log.record_id}</TableCell>
                  <TableCell className="text-gray-600">
                    {log.user_id ? log.user_id.substring(0, 8) + "..." : "System"}
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
