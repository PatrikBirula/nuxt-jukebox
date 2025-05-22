import { prisma } from "~/server/utils/prisma"
import bcrypt from "bcryptjs"

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, password } = body

    // Kontrola, zda uživatel již existuje
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      throw createError({
        statusCode: 400,
        message: "Uživatel s tímto emailem již existuje"
      })
    }

    // Hashování hesla
    const hashedPassword = await bcrypt.hash(password, 10)

    // Vytvoření nového uživatele
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword
      }
    })

    // Vytvoření session
    const session = await prisma.session.create({
      data: {
        userId: user.id
      }
    })

    // Nastavení cookie
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
    throw createError({
      statusCode: 500,
      message: "Nepodařilo se vytvořit účet"
    })
  }
}) 