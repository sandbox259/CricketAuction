import { getUserWithRole } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const user = await getUserWithRole()

  if (!user) {
    redirect("/viewer")
  }

  // Redirect based on user role
  if (user.role === "admin") {
    redirect("/admin")
  } else {
    redirect("/viewer")
  }
}
