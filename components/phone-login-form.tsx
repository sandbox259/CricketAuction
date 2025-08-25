"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Phone, Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function PhoneLoginForm() {
  const router = useRouter()
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
        options: {
          channel: "sms",
        },
      })

      if (error) throw error

      setSuccess("OTP sent successfully!")
      setStep("otp")
    } catch (err: any) {
      setError(err.message || "Failed to send OTP")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: otp,
        type: "sms",
      })

      if (error) throw error

      // Force page refresh to ensure middleware recognizes the session
      window.location.href = "/"
    } catch (err: any) {
      setError(err.message || "Failed to verify OTP")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Cricket Auction</h1>
        <p className="text-lg text-gray-600">
          {step === "phone" ? "Enter your phone number to continue" : "Enter the OTP sent to your phone"}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <form onSubmit={step === "phone" ? handleSendOtp : handleVerifyOtp} className="space-y-6">
          {error && <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600">{error}</div>}

          {success && step === "phone" && (
            <div className="px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600">
              {success}
            </div>
          )}

          <div className="space-y-4">
            {step === "phone" ? (
              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-900">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  className="h-12 text-lg rounded-lg bg-white border-gray-200 text-gray-900 focus:border-blue-600 focus:ring-blue-600"
                />
                <p className="text-xs text-gray-500">Include country code (e.g., +91 for India, +1 for US)</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label htmlFor="otp" className="block text-sm font-semibold text-gray-900">
                    Verification Code
                  </label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    maxLength={6}
                    className="h-12 text-lg text-center tracking-widest rounded-lg bg-white border-gray-200 text-gray-900 focus:border-blue-600 focus:ring-blue-600"
                  />
                  <p className="text-xs text-gray-500">Enter the 6-digit code sent to {phoneNumber}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep("phone")}
                  className="text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                >
                  ← Change phone number
                </Button>
              </>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-6 text-lg font-semibold rounded-xl h-[60px] transition-all duration-200 btn-scale shadow-sm bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {step === "otp" ? "Verifying..." : "Sending OTP..."}
              </>
            ) : (
              <>
                {step === "otp" ? (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Verify OTP
                  </>
                ) : (
                  <>
                    <Phone className="mr-2 h-4 w-4" />
                    Send OTP
                  </>
                )}
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
