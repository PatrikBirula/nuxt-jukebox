import { prisma } from "~/server/utils/prisma"

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Seznam veřejných routů
  const publicRoutes = ["/", "/login", "/register"]
  
  // Pokud je routa veřejná, povolíme přístup
  if (publicRoutes.includes(to.path)) {
    return
  }

  // Na klientovi musíme kontrolovat useState pro konzistenci s hydratací
  if (process.client) {
    const user = useState('user')
    
    // Pokud už máme načteného uživatele, povolíme přístup
    if (user.value) {
      return
    } else {
      return navigateTo("/")
    }
  }

  // Na serveru kontrolujeme session
  if (process.server) {
    // Získat session ID z cookie
    const sessionId = useCookie("session_id").value

    if (!sessionId) {
      // Na serveru, ale nemáme session - nastavíme user na null
      useState("user", () => null)
      return navigateTo("/")
    }

    try {
      // Ověřit session
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: { user: true }
      })

      if (!session) {
        // Neplatná session - nastavíme user na null
        useState("user", () => null)
        return navigateTo("/")
      }

      // Přidat uživatele do request state
      const user = session.user
      useState("user", () => ({
        id: user.id,
        email: user.email
      }))

      // Povolíme přístup
      return
    } catch (error) {
      // Nastavíme user na null
      useState("user", () => null)
      return navigateTo("/")
    }
  }
}) 