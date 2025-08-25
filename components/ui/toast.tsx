"use client"

import { useEffect } from "react"
import { toast } from "sonner"

interface RealtimeToastProps {
  isConnected: boolean
}

export function RealtimeToast({ isConnected }: RealtimeToastProps) {
  useEffect(() => {
    if (isConnected) {
      toast.success("Connected to live auction updates", {
        duration: 2000,
      })
    } else {
      toast.error("Disconnected from live updates", {
        duration: 3000,
      })
    }
  }, [isConnected])

  return null
}
