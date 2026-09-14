"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, LockKeyhole, Mail } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function PasswordLoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError("")

    try {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (signInError) throw signInError
      window.location.href = "/"
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in. Check your email and password.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20">
          <LockKeyhole className="h-8 w-8" />
        </div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-amber-500">Admin pavilion</p>
        <h1 className="font-serif text-4xl font-bold tracking-tight text-white">Cricket Auction</h1>
        <p className="mt-2 text-sm text-slate-400">Sign in to manage the live auction room.</p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-8 shadow-2xl backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</div>}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-semibold text-slate-200">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input id="email" type="email" autoComplete="email" placeholder="admin@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required className="h-12 rounded-xl border-white/10 bg-slate-950/60 pl-10 text-white placeholder:text-slate-600" />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-semibold text-slate-200">Password</label>
            <div className="relative">
              <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input id="password" type="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required className="h-12 rounded-xl border-white/10 bg-slate-950/60 pl-10 text-white placeholder:text-slate-600" />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-amber-400 font-bold text-slate-950 hover:bg-amber-300">
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</> : "Enter auction room"}
          </Button>
        </form>
      </div>
    </div>
  )
}

export { PasswordLoginForm }

// Keep the legacy filename import-compatible while the auth flow is password based.
export const PhoneLoginForm = PasswordLoginForm
