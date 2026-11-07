const LABEL =
  /^(?:n[úu]mero\s+de\s+)?(?:tombamento|patrim[oô]nio|tombo|etiqueta)\s*[:.\-]?\s*/i;
const SHORT_LABEL = /^(?:pat|n[º°.]|no\.?|nro\.?)\s*[:.\-]?\s+/i;
const CODE = /^[A-Za-z0-9][A-Za-z0-9./-]{2,79}$/;
const DATE =
  /^(?:\d{1,2}[./-]\d{1,2}[./-]\d{2,4}|\d{4}[./-]\d{1,2}[./-]\d{1,2})$/;

const isCodeToken = (value: string) =>
  (/\d/.test(value) && /^[A-Za-z0-9./-]+$/.test(value)) ||
  /^[A-Z]{2,5}$/.test(value);

export function pickPatrimony(text: string): string | null {
  const candidates: string[] = [];
  for (const raw of text.replace(/\u0000/g, " ").split(/\r?\n/)) {
    const line = raw.replace(LABEL, "").replace(SHORT_LABEL, "").trim();
    if (!line) continue;
    const compactLine = normalize(line);
    if (!/\s/.test(line) && CODE.test(compactLine) && /\d/.test(compactLine))
      candidates.push(compactLine);
    const pieces = line.split(/\s+/).map(normalize).filter(isCodeToken);
    if (!pieces.length) continue;
    const joined = pieces.join("");
    if (CODE.test(joined) && /\d/.test(joined)) candidates.push(joined);
    for (const piece of pieces)
      if (CODE.test(piece) && /\d/.test(piece)) candidates.push(piece);
  }
  const unique = [...new Set(candidates)];
  unique.sort((a, b) => score(b) - score(a) || b.length - a.length);
  return unique.find((value) => !DATE.test(value)) || null;
}

function normalize(value: string) {
  return value.replace(/\s+/g, "").replace(/^[./:-]+|[./:-]+$/g, "").slice(0, 80);
}

function score(value: string) {
  const digits = value.replace(/\D/g, "").length;
  return (DATE.test(value) ? -50 : 0) + digits * 10 + Math.min(value.length, 24);
}

export function imageKind(
  bytes: Buffer,
): "image/jpeg" | "image/png" | "image/webp" | null {
  if (bytes.length > 2 && bytes[0] === 0xff && bytes[1] === 0xd8)
    return "image/jpeg";
  if (
    bytes.length > 8 &&
    bytes.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    )
  )
    return "image/png";
  if (
    bytes.length > 12 &&
    bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
    bytes.subarray(8, 12).toString("ascii") === "WEBP"
  )
    return "image/webp";
  return null;
}

type OcrWord = { text: string; confidence: number };
type OcrWorker = {
  recognize: (image: Buffer) => Promise<{
    data: { text: string; words?: OcrWord[] };
  }>;
};

let workerPromise: Promise<OcrWorker> | null = null;
let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(job: () => Promise<T>): Promise<T> {
  const run = queue.then(job, job);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function worker() {
  if (!workerPromise) {
    workerPromise = (async () => {
      const { createWorker } = await import("tesseract.js");
      return createWorker("eng", 1, {
        cachePath: ".data/tesseract",
      }) as Promise<OcrWorker>;
    })().catch((error) => {
      workerPromise = null;
      throw error;
    });
  }
  return workerPromise;
}

async function readLocally(bytes: Buffer) {
  const engine = await worker();
  const result = await engine.recognize(bytes);
  const data = result.data as {
    text: string;
    confidence?: number;
    words?: OcrWord[];
    blocks?: {
      paragraphs?: { lines?: { words?: OcrWord[] }[] }[];
    }[] | null;
  };
  const words: OcrWord[] = [...(data.words || [])];
  for (const block of data.blocks || [])
    for (const paragraph of block.paragraphs || [])
      for (const line of paragraph.lines || []) words.push(...(line.words || []));
  if (!words.length) return pickPatrimony(data.text);
  const trusted = words.filter((item) => item.confidence >= 55);
  if (!trusted.length) return null;
  return pickPatrimony(trusted.map((item) => item.text).join(" "));
}

export async function readTombamento(
  bytes: Buffer,
  mime: string,
): Promise<string | null> {
  return enqueue(async () => {
    if (process.env.OPENAI_API_KEY?.trim() && process.env.OPENAI_MODEL?.trim()) {
      try {
        const fromModel = pickPatrimony(await readWithModel(bytes, mime));
        if (fromModel) return fromModel;
      } catch {
        // A leitura local ainda pode reconhecer a etiqueta.
      }
    }
    return readLocally(bytes);
  });
}

async function readWithModel(bytes: Buffer, mime: string) {
  const { default: OpenAI } = await import("openai");
  const { zodTextFormat } = await import("openai/helpers/zod");
  const { z } = await import("zod");
  const reading = z.object({ patrimony: z.string().nullable() });
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || undefined,
    timeout: 60000,
    maxRetries: 0,
  });
  const response = await client.responses.parse({
    model: process.env.OPENAI_MODEL!,
    store: false,
    instructions:
      "Você lê apenas o número de tombamento institucional visível na foto de uma etiqueta. Também pode aparecer como patrimônio ou tombo. Não use número de série, data, lote ou patrimônio inventado. Se a etiqueta não estiver legível, retorne patrimony null. Copie o código como está, sem explicação.",
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_image",
            detail: "high",
            image_url: `data:${mime};base64,${bytes.toString("base64")}`,
          },
          {
            type: "input_text",
            text: "Qual é o número de tombamento desta etiqueta?",
          },
        ],
      },
    ],
    text: { format: zodTextFormat(reading, "tombamento_label") },
  });
  return response.output_parsed?.patrimony || "";
}
