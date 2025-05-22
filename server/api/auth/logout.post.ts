import { prisma } from "~/server/utils/prisma"

export default defineEventHandler(async (event) => {
  try {
    const sessionId = getCookie(event, "session_id")

    if (sessionId) {
      // Smazat session z databáze
      await prisma.session.delete({
        where: { id: sessionId }
      })

      // Smazat cookie
      deleteCookie(event, "session_id")
    }

    return { success: true }
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Nepodařilo se odhlásit"
    })
  }
}) 