import { DomainError } from "./domain.js";

export function contractFile(file?: Express.Multer.File): {
  name: string;
  mime: string;
  bytes: Buffer;
} {
  if (!file || !file.size || file.size > 15 * 1024 * 1024)
    throw new DomainError("Selecione um PDF ou TXT não vazio, com até 15 MB.");
  let mime: string;
  if (
    file.originalname.toLowerCase().endsWith(".pdf") &&
    file.buffer.subarray(0, 5).toString() === "%PDF-"
  )
    mime = "application/pdf";
  else if (file.originalname.toLowerCase().endsWith(".txt")) {
    try {
      new TextDecoder("utf-8", { fatal: true }).decode(file.buffer);
    } catch {
      throw new DomainError("O TXT precisa usar codificação UTF-8.");
    }
    if (file.buffer.includes(0))
      throw new DomainError("O arquivo não é um texto válido.");
    mime = "text/plain";
  } else throw new DomainError("Formato inválido. Envie um PDF ou TXT.");
  return {
    name: file.originalname.replace(/[\x00-\x1f\x7f/\\]/g, "_").slice(0, 180),
    mime,
    bytes: file.buffer,
  };
}
