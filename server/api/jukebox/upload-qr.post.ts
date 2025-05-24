import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { randomUUID } from 'crypto';
import { prisma } from "~/server/utils/prisma";
import { parseFormData } from "~/server/utils/formdata";

// Funkce pro zajištění, že adresář existuje
async function ensureDir(dir: string) {
  try {
    await mkdir(dir, { recursive: true });
  } catch (error) {
    // Ignorujeme chybu, pokud adresář již existuje
    if ((error as any).code !== 'EEXIST') {
      throw error;
    }
  }
}

export default defineEventHandler(async (event) => {
  try {
    // Kontrola, zda je uživatel přihlášený
    const sessionId = getCookie(event, "session_id");
    if (!sessionId) {
      throw createError({
        statusCode: 401,
        message: "Nepřihlášený uživatel"
      });
    }

    // Získání session a uživatele
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true }
    });

    if (!session) {
      throw createError({
        statusCode: 401,
        message: "Neplatná session"
      });
    }

    // Parsování multipart/form-data s obrázkem pomocí vlastní funkce
    const { files } = await parseFormData(event);
    
    // Získání nahraného souboru
    const qrCodeFile = files['qrCode'];
    
    if (!qrCodeFile) {
      throw createError({
        statusCode: 400,
        message: "QR kód nebyl nalezen ve formuláři"
      });
    }

    // Kontrola typu souboru
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    if (!qrCodeFile.type || !validMimeTypes.includes(qrCodeFile.type)) {
      throw createError({
        statusCode: 400,
        message: "Nepodporovaný formát souboru. Povolené formáty: JPEG, PNG, GIF."
      });
    }

    // Generování unikátního názvu souboru
    const fileExtension = qrCodeFile.type.split('/')[1];
    const fileName = `${randomUUID()}.${fileExtension}`;
    
    // Cesta k adresáři pro ukládání souborů
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    
    // Ujistíme se, že adresář existuje
    await ensureDir(uploadDir);
    
    // Uložení souboru
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, qrCodeFile.data);
    
    // URL k souboru (relativní k veřejnému adresáři)
    const fileUrl = `/uploads/${fileName}`;
    
    // Zde by bylo potřeba uložit cestu k souboru do databáze
    // V produkční aplikaci byste vytvořili model pro nastavení jukeboxu
    // a uložili URL k QR kódu
    
    return {
      success: true,
      qrCodeUrl: fileUrl,
      message: "QR kód byl úspěšně nahrán"
    };
    
  } catch (error) {
    console.error("Chyba při nahrávání QR kódu:", error);
    throw createError({
      statusCode: 500,
      message: `Nepodařilo se nahrát QR kód: ${error instanceof Error ? error.message : 'Neznámá chyba'}`
    });
  }
}); 