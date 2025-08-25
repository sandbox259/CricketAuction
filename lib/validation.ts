import { z } from "zod"

// Phone number validation schema
export const phoneSchema = z
  .string()
  .min(10, "Phone number must be at least 10 digits")
  .max(15, "Phone number must be at most 15 digits")
  .regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number with country code")

// OTP validation schema
export const otpSchema = z
  .string()
  .length(6, "OTP must be exactly 6 digits")
  .regex(/^\d{6}$/, "OTP must contain only numbers")

// Player validation schema
export const playerSchema = z.object({
  name: z
    .string()
    .min(2, "Player name must be at least 2 characters")
    .max(100, "Player name must be at most 100 characters")
    .regex(/^[a-zA-Z\s.'-]+$/, "Player name can only contain letters, spaces, dots, apostrophes, and hyphens"),
  position: z.enum(["Batsman", "Bowler", "All-rounder", "Wicket-keeper"], {
    errorMap: () => ({ message: "Please select a valid position" }),
  }),
  base_price: z
    .number()
    .min(1000000, "Base price must be at least ₹10 Lakh")
    .max(200000000, "Base price cannot exceed ₹20 Crore"),
})

// Assignment validation schema
export const assignmentSchema = z.object({
  player_id: z.number().positive("Please select a valid player"),
  team_id: z.number().positive("Please select a valid team"),
  final_price: z
    .number()
    .min(1000000, "Final price must be at least ₹10 Lakh")
    .max(500000000, "Final price cannot exceed ₹50 Crore"),
})

// User role validation schema
export const userRoleSchema = z.object({
  role: z.enum(["admin", "viewer"], {
    errorMap: () => ({ message: "Role must be either admin or viewer" }),
  }),
  team_id: z.number().positive().optional(),
})

// Sanitize input function
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/['"]/g, "") // Remove quotes to prevent injection
    .substring(0, 1000) // Limit length
}

// Validate and sanitize phone number
export function validatePhone(phone: string): { isValid: boolean; sanitized: string; error?: string } {
  try {
    const sanitized = sanitizeInput(phone)
    phoneSchema.parse(sanitized)
    return { isValid: true, sanitized }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, sanitized: phone, error: error.errors[0].message }
    }
    return { isValid: false, sanitized: phone, error: "Invalid phone number" }
  }
}

// Validate OTP
export function validateOTP(otp: string): { isValid: boolean; error?: string } {
  try {
    otpSchema.parse(otp)
    return { isValid: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0].message }
    }
    return { isValid: false, error: "Invalid OTP" }
  }
}
