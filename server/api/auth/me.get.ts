import { prisma } from '~/server/utils/prisma';

export default defineEventHandler(async (event) => {
  try {
    // Získat session ID z cookie
    const sessionId = getCookie(event, 'session_id');

    if (!sessionId) {
      return {
        user: null
      };
    }

    // Ověřit session
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true }
    });

    if (!session) {
      return {
        user: null
      };
    }

    // Vrátit data uživatele
    return {
      user: {
        id: session.user.id,
        email: session.user.email
      }
    };
  } catch (error) {
    // Vrátit error
    throw createError({
      statusCode: 500,
      statusMessage: 'Serverová chyba při získávání uživatele'
    });
  }
}); 