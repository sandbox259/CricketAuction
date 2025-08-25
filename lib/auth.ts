import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function getUser() {
  const supabase = createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

export async function getUserWithRole() {
  const user = await getUser()
  if (!user) return null

  const supabase = createClient()

  try {
    const { data: userData, error } = await supabase
      .from("users")
      .select("role, team_id, phone")
      .eq("id", user.id)
      .single()

    if (error) {
      console.error("Error fetching user role:", error)
      return { ...user, role: "viewer", team_id: null, phone: null }
    }

    return { ...user, ...userData }
  } catch (err) {
    // Handle rate limiting or other non-JSON responses
    console.error("Error fetching user role:", err)
    return { ...user, role: "viewer", team_id: null, phone: null }
  }
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    redirect("/auth/login")
  }
  return user
}

export async function requireAdmin() {
  const userWithRole = await getUserWithRole()
  if (!userWithRole || userWithRole.role !== "admin") {
    redirect("/auth/unauthorized")
  }
  return userWithRole
}
