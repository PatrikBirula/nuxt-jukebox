import type { H3Event } from 'h3';
import * as formidable from 'formidable';
import { readFile } from 'fs/promises';

export interface FormDataFile {
  name: string;
  type: string;
  data: Buffer;
  size: number;
}

export async function parseFormData(event: H3Event): Promise<{ fields: Record<string, any>, files: Record<string, FormDataFile> }> {
  try {
    const form = new formidable.IncomingForm({
      maxFileSize: 5 * 1024 * 1024, // 5MB
      multiples: false,
    });

    return await new Promise((resolve, reject) => {
      form.parse(event.node.req, async (err: Error | null, fields: formidable.Fields, files: formidable.Files) => {
        if (err) {
          reject(err);
          return;
        }

        // Převedení formidable souborů na vlastní formát
        const processedFiles: Record<string, FormDataFile> = {};
        
        // Zpracování souborů
        for (const [key, fileArr] of Object.entries(files)) {
          const file = Array.isArray(fileArr) ? fileArr[0] : fileArr;
          
          if (file && file.filepath) {
            try {
              const fileData = await readFile(file.filepath);
              
              processedFiles[key] = {
                name: file.originalFilename || 'unknown',
                type: file.mimetype || 'application/octet-stream',
                size: file.size,
                data: fileData
              };
            } catch (readError) {
              console.error('Chyba při čtení souboru:', readError);
              // Pokračujeme s dalšími soubory
            }
          }
        }

        resolve({
          fields: fields as Record<string, any>,
          files: processedFiles
        });
      });
    });
  } catch (error) {
    console.error('Chyba při zpracování formData:', error);
    throw new Error('Nepodařilo se zpracovat form data');
  }
} 