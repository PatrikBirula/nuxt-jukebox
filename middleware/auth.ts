import { prisma } from "~/server/utils/prisma"

export default defineNuxtRouteMiddleware(async (to) => {
  // Seznam veřejných routů
  const publicRoutes = ["/", "/login", "/register"]
  
  // Pokud je routa veřejná, povolíme přístup
  if (publicRoutes.includes(to.path)) {
    return
  }

  // Získat session ID z cookie
  const sessionId = useCookie("session_id").value

  if (!sessionId) {
    return navigateTo("/")
  }

  try {
    // Ověřit session
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true }
    })

    if (!session) {
      return navigateTo("/")
    }

    // Přidat uživatele do request state
    const user = session.user
    useState("user", () => ({
      id: user.id,
      email: user.email
    }))
  } catch (error) {
    console.error("Chyba při ověřování session:", error)
    return navigateTo("/")
  }
}) 