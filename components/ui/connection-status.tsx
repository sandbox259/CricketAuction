"use client"

import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff } from "lucide-react"

interface ConnectionStatusProps {
  isConnected: boolean
  lastUpdate?: Date
}

export function ConnectionStatus({ isConnected, lastUpdate }: ConnectionStatusProps) {
  return (
    <div className="flex items-center space-x-2">
      <Badge
        variant={isConnected ? "default" : "destructive"}
        className={`${isConnected ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"} text-white`}
      >
        {isConnected ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
        {isConnected ? "LIVE" : "OFFLINE"}
      </Badge>
      {lastUpdate && <span className="text-xs text-gray-400">Updated {lastUpdate.toLocaleTimeString()}</span>}
    </div>
  )
}
