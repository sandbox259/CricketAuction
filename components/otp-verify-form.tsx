"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { verifyOtp } from "@/lib/actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg font-medium rounded-lg h-[60px]"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Verifying...
        </>
      ) : (
        <>
          <Shield className="mr-2 h-4 w-4" />
          Verify OTP
        </>
      )}
    </Button>
  )
}

interface OtpVerifyFormProps {
  phone: string
}

export default function OtpVerifyForm({ phone }: OtpVerifyFormProps) {
  const router = useRouter()
  const [state, formAction] = useActionState(verifyOtp, null)

  // Handle successful verification by redirecting
  useEffect(() => {
    if (state?.success && state?.redirect) {
      router.push(state.redirect)
    }
  }, [state, router])

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white">Verify OTP</h1>
        <p className="text-lg text-gray-300">Enter the 6-digit code sent to</p>
        <p className="text-orange-400 font-medium">{phone}</p>
      </div>

      <form action={formAction} className="space-y-6">
        {state?.error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">{state.error}</div>
        )}

        <input type="hidden" name="phone" value={phone} />

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="otp" className="block text-sm font-medium text-gray-300">
              OTP Code
            </label>
            <Input
              id="otp"
              name="otp"
              type="text"
              placeholder="123456"
              maxLength={6}
              required
              className="bg-white/10 border-gray-600 text-white placeholder:text-gray-400 focus:border-orange-500 text-center text-2xl tracking-widest"
            />
          </div>
        </div>

        <SubmitButton />

        <div className="text-center">
          <Button
            type="button"
            variant="ghost"
            className="text-gray-400 hover:text-white"
            onClick={() => router.push("/auth/login")}
          >
            Use different phone number
          </Button>
        </div>
      </form>
    </div>
  )
}
