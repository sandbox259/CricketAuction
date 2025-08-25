import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import OtpVerifyForm from "@/components/otp-verify-form"

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: { phone?: string }
}) {
  // Check if user is already logged in
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is logged in, redirect to home page
  if (session) {
    redirect("/")
  }

  // If no phone number provided, redirect to login
  if (!searchParams.phone) {
    redirect("/auth/login")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 px-4 py-12 sm:px-6 lg:px-8">
      <OtpVerifyForm phone={searchParams.phone} />
    </div>
  )
}
