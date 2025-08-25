import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Rate limiting function
export function rateLimit(identifier: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now()
  const key = identifier
  const record = rateLimitStore.get(key)

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= maxRequests) {
    return false
  }

  record.count++
  return true
}

// Get client IP address
export function getClientIP(): string {
  const headersList = headers()
  const forwarded = headersList.get("x-forwarded-for")
  const realIP = headersList.get("x-real-ip")

  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }

  if (realIP) {
    return realIP
  }

  return "unknown"
}

// Security headers
export const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
}

// Audit logging function
export async function auditLog(
  action: string,
  tableName: string,
  recordId: number,
  userId?: string,
  oldValues?: any,
  newValues?: any,
) {
  try {
    const supabase = createClient()
    await supabase.from("audit_log").insert({
      table_name: tableName,
      record_id: recordId,
      action,
      old_values: oldValues,
      new_values: newValues,
      user_id: userId,
    })
  } catch (error) {
    console.error("Audit logging failed:", error)
  }
}

// Check if user has permission for action
export async function checkPermission(userId: string, requiredRole: "admin" | "viewer"): Promise<boolean> {
  try {
    const supabase = createClient()
    const { data: user } = await supabase.from("users").select("role").eq("id", userId).single()

    if (!user) return false

    if (requiredRole === "admin") {
      return user.role === "admin"
    }

    return user.role === "admin" || user.role === "viewer"
  } catch (error) {
    console.error("Permission check failed:", error)
    return false
  }
}

// Sanitize database query parameters
export function sanitizeQueryParams(params: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {}

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") {
      sanitized[key] = value.trim().substring(0, 1000)
    } else if (typeof value === "number") {
      sanitized[key] = Math.max(0, Math.min(value, Number.MAX_SAFE_INTEGER))
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}
