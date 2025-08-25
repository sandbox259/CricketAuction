import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ShieldX } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-4">
          <ShieldX className="mx-auto h-16 w-16 text-red-400" />
          <h1 className="text-3xl font-bold text-white">Access Denied</h1>
          <p className="text-lg text-gray-300">You don't have permission to access this page.</p>
        </div>

        <div className="space-y-4">
          <Link href="/">
            <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">Go to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
