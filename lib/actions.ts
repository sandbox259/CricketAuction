"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { validatePhone, validateOTP } from "@/lib/validation"
import { rateLimit, getClientIP, auditLog } from "@/lib/security"
import { AuthenticationError } from "@/lib/error-handling"

export async function signInWithPhone(prevState: any, formData: FormData) {
  const clientIP = getClientIP()

  // Rate limiting
  if (!rateLimit(`phone-auth-${clientIP}`, 5, 300000)) {
    // 5 requests per 5 minutes
    return { error: "Too many authentication attempts. Please try again later." }
  }

  if (!formData) {
    return { error: "Form data is missing" }
  }

  const phoneInput = formData.get("phone")?.toString()

  if (!phoneInput) {
    return { error: "Phone number is required" }
  }

  // Validate and sanitize phone number
  const { isValid, sanitized, error: validationError } = validatePhone(phoneInput)
  if (!isValid) {
    return { error: validationError }
  }

  const supabase = createClient()

  try {
    const { error } = await supabase.auth.signInWithOtp({
      phone: sanitized,
      options: {
        shouldCreateUser: true,
      },
    })

    if (error) {
      // Log failed authentication attempt
      await auditLog("FAILED_AUTH", "auth_attempts", 0, undefined, { phone: sanitized, error: error.message })
      return { error: error.message }
    }

    // Log successful OTP send
    await auditLog("OTP_SENT", "auth_attempts", 0, undefined, { phone: sanitized })

    return {
      success: true,
      message: "OTP sent to your phone number. Please check your messages.",
      phone: sanitized,
    }
  } catch (error) {
    console.error("Phone auth error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function verifyOtp(prevState: any, formData: FormData) {
  const clientIP = getClientIP()

  // Rate limiting for OTP verification
  if (!rateLimit(`otp-verify-${clientIP}`, 10, 300000)) {
    // 10 attempts per 5 minutes
    return { error: "Too many verification attempts. Please try again later." }
  }

  if (!formData) {
    return { error: "Form data is missing" }
  }

  const phone = formData.get("phone")?.toString()
  const otpInput = formData.get("otp")?.toString()

  if (!phone || !otpInput) {
    return { error: "Phone number and OTP are required" }
  }

  // Validate OTP format
  const { isValid, error: otpError } = validateOTP(otpInput)
  if (!isValid) {
    return { error: otpError }
  }

  const supabase = createClient()

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phone,
      token: otpInput,
      type: "sms",
    })

    if (error) {
      await auditLog("FAILED_OTP_VERIFY", "auth_attempts", 0, undefined, { phone, error: error.message })
      return { error: error.message }
    }

    if (data.user) {
      // Check if user exists in our users table
      const { data: existingUser } = await supabase.from("users").select("id").eq("id", data.user.id).single()

      // If user doesn't exist in our users table, create them
      if (!existingUser) {
        const { error: insertError } = await supabase.from("users").insert({
          id: data.user.id,
          phone: phone,
          role: "viewer", // Default role
        })

        if (insertError) {
          console.error("Error creating user record:", insertError)
          return { error: "Failed to create user account" }
        }

        await auditLog("USER_CREATED", "users", 0, data.user.id, undefined, { phone, role: "viewer" })
      }

      await auditLog("SUCCESSFUL_LOGIN", "auth_attempts", 0, data.user.id, { phone })

      revalidatePath("/", "layout")
      revalidatePath("/admin")
      revalidatePath("/viewer")

      await new Promise((resolve) => setTimeout(resolve, 100))

      return {
        success: true,
        message: "OTP verified successfully",
        user: data.user,
      }
    }

    return { error: "Invalid OTP" }
  } catch (error) {
    console.error("OTP verification error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect("/auth/login")
}

export async function updateUserRole(userId: string, role: "admin" | "viewer", teamId?: number) {
  const supabase = createClient()

  // Get current user to check permissions
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new AuthenticationError()
  }

  // Check if current user is admin
  const { data: currentUser } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (!currentUser || currentUser.role !== "admin") {
    throw new Error("Only admins can update user roles")
  }

  // Get old values for audit
  const { data: oldUser } = await supabase.from("users").select("role, team_id").eq("id", userId).single()

  const { error } = await supabase
    .from("users")
    .update({
      role: role,
      team_id: teamId || null,
    })
    .eq("id", userId)

  if (error) {
    throw new Error(error.message)
  }

  // Audit log the role change
  await auditLog("UPDATE", "users", Number.parseInt(userId), user.id, oldUser, { role, team_id: teamId })

  revalidatePath("/")
}
