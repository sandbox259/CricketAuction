import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import PasswordLoginForm from "@/components/phone-login-form"

export default async function LoginPage() {
  // Check if user is already logged in
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is logged in, redirect to home page
  if (session) {
    redirect("/")
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07111f] px-4 py-12 sm:px-6 lg:px-8 before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.16),transparent_42%)] before:content-['']">
      <PasswordLoginForm />
    </div>
  )
}
