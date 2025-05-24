const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    // Hashování hesla
    const hashedPassword = await bcrypt.hash('testpassword', 10);

    // Vytvoření uživatele
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: hashedPassword,
      },
    });

    console.log('Uživatel byl úspěšně vytvořen:', user);
  } catch (error) {
    console.error('Chyba při vytváření uživatele:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 