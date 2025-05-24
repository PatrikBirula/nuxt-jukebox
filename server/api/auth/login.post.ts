import { prisma } from "~/server/utils/prisma"
import bcrypt from "bcryptjs"

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, password } = body

    // Najít uživatele
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      throw createError({
        statusCode: 401,
        message: "Nesprávný email nebo heslo"
      })
    }

    // Ověřit heslo
    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
      throw createError({
        statusCode: 401,
        message: "Nesprávný email nebo heslo"
      })
    }

    // Nastavit expiraci session na 7 dní
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // Vytvořit novou session
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        expiresAt
      }
    })

    // Nastavit cookie
    setCookie(event, "session_id", session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7 // 7 dní
    })

    return {
      user: {
        id: user.id,
        email: user.email
      }
    }
  } catch (error) {
    console.error("Chyba při přihlášení:", error)
    throw createError({
      statusCode: 500,
      message: "Nepodařilo se přihlásit"
    })
  }
}) 