import { randomBytes } from "node:crypto";

export type CaptureRowInput = { key: string; name: string };
export type CaptureView = {
  photosSubmitted: boolean;
  rows: {
    key: string;
    name: string;
    patrimony: string | null;
    readAt: string | null;
  }[];
};

export type CaptureResult<T> =
  | { type: "ok"; status?: number; body: T }
  | { type: "missing" }
  | { type: "blocked"; message: string }
  | { type: "conflict"; message: string }
  | { type: "invalid"; message: string }
  | { type: "unavailable"; message: string };

type Photo = { patrimony: string; readAt: string };
type Session = {
  expiresAt: number;
  blocked: "saved" | "closed" | null;
  reads: number;
  rows: { key: string; name: string }[];
  photos: Map<string, Photo>;
};

const TOKEN = /^[a-f0-9]{64}$/;
const TTL = 2 * 60 * 60 * 1000;
const blockedMessage = (reason: "saved" | "closed") =>
  reason === "saved"
    ? "Este link foi encerrado. O cadastro já foi salvo."
    : "Este link foi encerrado.";

export function createCaptureSessions(
  read: (bytes: Buffer, mime: string) => Promise<string | null>,
) {
  const sessions = new Map<string, Session>();

  function sessionOf(token: string) {
    if (!TOKEN.test(token)) return null;
    const session = sessions.get(token);
    if (!session) return null;
    if (!session.blocked && Date.now() > session.expiresAt)
      session.blocked = "closed";
    return session;
  }

  function view(session: Session): CaptureView {
    return {
      photosSubmitted: session.photos.size > 0,
      rows: session.rows.map((row) => {
        const photo = session.photos.get(row.key);
        return {
          key: row.key,
          name: row.name,
          patrimony: photo?.patrimony || null,
          readAt: photo?.readAt || null,
        };
      }),
    };
  }

  function rowsOf(rows: CaptureRowInput[]): CaptureResult<CaptureRowInput[]> {
    if (new Set(rows.map((row) => row.key)).size !== rows.length)
      return {
        type: "invalid",
        message: "A lista de equipamentos tem identificadores repetidos.",
      };
    return { type: "ok", body: rows };
  }

  return {
    create(rows: CaptureRowInput[]): CaptureResult<{
      token: string;
      path: string;
    }> {
      const parsed = rowsOf(rows);
      if (parsed.type !== "ok") return parsed;
      const token = randomBytes(32).toString("hex");
      sessions.set(token, {
        expiresAt: Date.now() + TTL,
        blocked: null,
        reads: 0,
        rows: parsed.body.map((row) => ({ key: row.key, name: row.name })),
        photos: new Map(),
      });
      return {
        type: "ok",
        status: 201,
        body: { token, path: `/captura/${token}` },
      };
    },
    view(token: string): CaptureResult<CaptureView> {
      const session = sessionOf(token);
      if (!session) return { type: "missing" };
      if (session.blocked)
        return { type: "blocked", message: blockedMessage(session.blocked) };
      return { type: "ok", body: view(session) };
    },
    sync(token: string, rows: CaptureRowInput[]): CaptureResult<CaptureView> {
      const session = sessionOf(token);
      if (!session) return { type: "missing" };
      if (session.blocked)
        return { type: "blocked", message: blockedMessage(session.blocked) };
      const parsed = rowsOf(rows);
      if (parsed.type !== "ok") return parsed;
      const keys = new Set(parsed.body.map((row) => row.key));
      for (const key of session.photos.keys())
        if (!keys.has(key)) session.photos.delete(key);
      session.rows = parsed.body.map((row) => ({ key: row.key, name: row.name }));
      return { type: "ok", body: view(session) };
    },
    async photo(
      token: string,
      rowKey: string,
      bytes: Buffer,
      mime: string,
    ): Promise<CaptureResult<{ key: string; patrimony: string; readAt: string }>> {
      const session = sessionOf(token);
      if (!session) return { type: "missing" };
      if (session.blocked)
        return { type: "blocked", message: blockedMessage(session.blocked) };
      if (!session.rows.some((row) => row.key === rowKey))
        return {
          type: "invalid",
          message:
            "Este equipamento não está mais na conferência. Atualize a página.",
        };
      if (session.reads >= 40)
        return {
          type: "invalid",
          message:
            "Esta conferência já recebeu muitas fotos. Digite o número restante na conferência.",
        };
      let patrimony: string | null;
      try {
        patrimony = await read(bytes, mime);
      } catch {
        return {
          type: "unavailable",
          message: "Não foi possível ler esta foto. Tente novamente.",
        };
      }
      if (!patrimony)
        return {
          type: "invalid",
          message:
            "Não foi possível ler o número de tombamento nesta foto. Aproxime a etiqueta e tente de novo.",
        };
      const readAt = new Date().toISOString();
      session.photos.set(rowKey, { patrimony, readAt });
      session.reads += 1;
      return { type: "ok", body: { key: rowKey, patrimony, readAt } };
    },
    seal(token: string): CaptureResult<{ blocked: true }> {
      const session = sessionOf(token);
      if (!session) return { type: "missing" };
      if (session.blocked) return { type: "ok", body: { blocked: true } };
      if (!session.photos.size)
        return {
          type: "conflict",
          message:
            "Envie ao menos uma foto do tombamento antes de encerrar o link.",
        };
      session.blocked = "saved";
      return { type: "ok", body: { blocked: true } };
    },
    revoke(token: string): CaptureResult<{ blocked: true }> {
      const session = sessionOf(token);
      if (!session) return { type: "missing" };
      if (!session.blocked) session.blocked = "closed";
      return { type: "ok", body: { blocked: true } };
    },
  };
}
