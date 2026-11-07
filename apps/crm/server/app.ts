import express from "express";
import multer from "multer";
import {
  createHash,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import { z } from "zod";
import { resolve } from "node:path";
import { assetInput, DomainError, eventsFor, occurrence, prepareAsset, validDate } from "./domain.js";
import { aiReady, extractContract } from "./extraction.js";
import { createStore } from "./store.js";

export function createApp(options: {
  database: string;
  password?: string;
  seed?: boolean;
  staticDirectory?: string;
}) {
  const store = createStore(options.database, options.seed);
  const app = express();
  const sessions = new Map<string, number>();
  const attempts = new Map<string, { count: number; since: number }>();
  const extracting = new Set<string>();
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 15 * 1024 * 1024, files: 1, fields: 0 },
  });
  app.disable("x-powered-by");
  app.use((_req, res, next) => {
    res.set({
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "same-origin",
      "X-Frame-Options": "DENY",
    });
    next();
  });
  app.use("/api", (req, res, next) => {
    if (!["localhost", "127.0.0.1", "[::1]", "::1"].includes(req.hostname))
      return res
        .status(403)
        .json({ error: "A aplicação é local. Use localhost ou 127.0.0.1." });
    const origin = req.get("origin");
    const origins = [
      `http://${req.get("host")}`,
      "http://127.0.0.1:5173",
      "http://localhost:5173",
    ];
    if (origin && !origins.includes(origin))
      return res.status(403).json({ error: "Origem não autorizada." });
    res.set("Cache-Control", "no-store");
    next();
  });
  app.use(express.json({ limit: "128kb" }));
  const authenticated = (cookie?: string) => {
    if (!options.password) return true;
    const token = cookie
      ?.split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith("consta_session="))
      ?.slice(15);
    if (!token) return false;
    const expiry = sessions.get(token);
    if (!expiry || expiry < Date.now()) {
      sessions.delete(token);
      return false;
    }
    return true;
  };
  app.get("/api/config", (req, res) =>
    res.json({
      aiReady: aiReady(),
      authenticated: authenticated(req.get("cookie")),
      passwordRequired: Boolean(options.password),
      mode: options.password ? "local-protected" : "local-demo",
    }),
  );
  app.post("/api/login", (req, res) => {
    const key = req.ip || "local";
    let attempt = attempts.get(key);
    if (!attempt || Date.now() - attempt.since > 300000) {
      attempt = { count: 0, since: Date.now() };
      attempts.set(key, attempt);
    }
    if (attempt.count >= 10)
      return res
        .status(429)
        .json({
          error: "Muitas tentativas. Tente novamente em cinco minutos.",
        });
    const supplied =
      typeof req.body?.password === "string" ? req.body.password : "";
    const digest = (value: string) =>
      createHash("sha256").update(value).digest();
    if (
      options.password &&
      !timingSafeEqual(digest(supplied), digest(options.password))
    ) {
      attempt.count++;
      return res.status(401).json({ error: "Senha incorreta." });
    }
    const token = randomBytes(32).toString("hex");
    sessions.set(token, Date.now() + 8 * 3600000);
    attempts.delete(key);
    res.cookie("consta_session", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 8 * 3600000,
      path: "/api",
    });
    res.json({ ok: true });
  });
  app.post("/api/logout", (req, res) => {
    const token = req
      .get("cookie")
      ?.split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith("consta_session="))
      ?.slice(15);
    if (token) sessions.delete(token);
    res.clearCookie("consta_session", { path: "/api" }).json({ ok: true });
  });
  app.use("/api", (req, res, next) =>
    authenticated(req.get("cookie"))
      ? next()
      : res
          .status(401)
          .json({
            error: "Entre novamente para acessar os cadastros e contratos.",
          }),
  );
  app.get("/api/assets", (_req, res) => res.json(store.listAssets()));
  app.get("/api/events", (req, res) => {
    const from = String(req.query.from || "");
    const to = String(req.query.to || "");
    if (
      !validDate(from) ||
      !validDate(to) ||
      from > to ||
      to > occurrence(from, 2, "years", 1)
    )
      return res
        .status(400)
        .json({
          error: "Informe um intervalo de consulta válido de até dois anos.",
        });
    res.json(eventsFor(store.listAssets(), from, to));
  });
  const saveAsset: express.RequestHandler = (req, res) => {
    const input = assetInput.parse(req.body);
    const existing = req.params.id
      ? store.listAssets().find((asset) => asset.id === req.params.id)
      : undefined;
    if (req.params.id && !existing)
      return res.status(404).json({ error: "Equipamento não encontrado." });
    if (input.contractId && !store.getContract(input.contractId))
      return res
        .status(400)
        .json({ error: "Contrato não encontrado. Envie o arquivo novamente." });
    if (
      store
        .listAssets()
        .some(
          (asset) =>
            asset.id !== existing?.id &&
            asset.patrimony.toLocaleUpperCase("pt-BR") ===
              input.patrimony.toLocaleUpperCase("pt-BR"),
        )
    )
      return res
        .status(409)
        .json({
          error:
            "Este patrimônio já está cadastrado. Abra o cadastro existente para editar.",
        });
    res
      .status(existing ? 200 : 201)
      .json(
        store.saveAsset(prepareAsset(existing, input)), 
      );
  };
  app.post("/api/assets", saveAsset);
  app.post("/api/assets/batch", (req, res) => {
    const input = z.object({ existingId: z.string().uuid().optional(), assets: z.array(assetInput).min(1).max(50) }).parse(req.body);
    const existing = input.existingId ? store.listAssets().find(asset => asset.id === input.existingId) : undefined;
    if (input.existingId && !existing) throw new DomainError("Equipamento não encontrado.");
    const known = new Set(store.listAssets().filter(asset => asset.id !== existing?.id).map(asset => asset.patrimony.toLocaleUpperCase("pt-BR")));
    for (const asset of input.assets) {
      const key = asset.patrimony.toLocaleUpperCase("pt-BR");
      if (known.has(key)) throw new DomainError(`O patrimônio ${asset.patrimony} já está cadastrado ou foi repetido.`);
      known.add(key);
      if (asset.contractId && !store.getContract(asset.contractId)) throw new DomainError("Contrato não encontrado.");
    }
    res.status(201).json(store.saveAssets(input.assets.map((input, index) => prepareAsset(index === 0 ? existing : undefined, input))));
  });
  app.post("/api/assets/:id/contracts", (req, res) => {
    const { additionalAssetIds = [], ...body } = req.body || {};
    const ids = z.array(z.string().uuid()).max(49).parse(additionalAssetIds);
    const input = assetInput.parse(body);
    if (!input.contractId || !store.getContract(input.contractId)) throw new DomainError("Envie o novo contrato antes de salvar.");
    const existing = store.listAssets();
    const targetIds = [...new Set([String(req.params.id), ...ids])];
    const updated = targetIds.map(id => {
      const asset = existing.find(asset => asset.id === id);
      if (!asset) throw new DomainError("Um dos equipamentos selecionados não foi encontrado.");
      return prepareAsset(asset, id === req.params.id ? input : {...input, name: asset.name, model: asset.model, patrimony: asset.patrimony, serial: asset.serial, sector: asset.sector, notes: asset.notes}, true);
    });
    res.json(store.saveAssets(updated));
  });
  app.put("/api/assets/:id", saveAsset);
  app.post("/api/contracts", upload.single("file"), (req, res) => {
    const file = req.file;
    if (!file || !file.size)
      return res
        .status(400)
        .json({ error: "Selecione um PDF ou TXT não vazio, com até 15 MB." });
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
        return res
          .status(400)
          .json({ error: "O TXT precisa usar codificação UTF-8." });
      }
      if (file.buffer.includes(0))
        return res
          .status(400)
          .json({ error: "O arquivo não é um texto válido." });
      mime = "text/plain";
    } else
      return res
        .status(400)
        .json({ error: "Formato inválido. Envie um PDF ou TXT." });
    const name = file.originalname
      .replace(/[\x00-\x1f\x7f/\\]/g, "_")
      .slice(0, 180);
    res.status(201).json(store.upload(name, mime, file.buffer));
  });
  app.get("/api/contracts/:id", (req, res) => {
    const contract = store.getContract(req.params.id);
    if (!contract)
      return res.status(404).json({ error: "Contrato não encontrado." });
    res.json(contract);
  });
  app.get("/api/contracts/:id/file", (req, res) => {
    const contract = store.getContract(req.params.id);
    const bytes = store.getBytes(req.params.id);
    if (!contract || !bytes)
      return res.status(404).json({ error: "Contrato não encontrado." });
    res
      .set({
        "Content-Type": contract.mime,
        "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(contract.name)}`,
        "Content-Security-Policy": "sandbox; default-src 'none'",
      })
      .send(bytes);
  });
  app.post("/api/contracts/:id/extract", async (req, res) => {
    const contract = store.getContract(req.params.id);
    const bytes = store.getBytes(req.params.id);
    if (!contract || !bytes)
      return res.status(404).json({ error: "Contrato não encontrado." });
    if (!aiReady())
      return res
        .status(503)
        .json({
          error:
            "Leitura por IA ainda não configurada. Você pode preencher os dados manualmente.",
        });
    if (extracting.size)
      return res
        .status(409)
        .json({
          error:
            "Já existe uma leitura em andamento. Aguarde e tente novamente.",
        });
    extracting.add(contract.id);
    try {
      res.json(
        store.saveExtraction(
          contract.id,
          await extractContract(bytes, contract.name, contract.mime),
        ),
      );
    } catch {
      res
        .status(502)
        .json({
          error:
            "Não foi possível ler o contrato. Confira a configuração do provedor ou tente novamente. Seu arquivo foi preservado e o cadastro manual continua disponível.",
        });
    } finally {
      extracting.delete(contract.id);
    }
  });
  app.use("/api", (_req, res) =>
    res.status(404).json({ error: "Recurso não encontrado." }),
  );
  if (options.staticDirectory) {
    app.use(express.static(resolve(options.staticDirectory)));
    app.get("/{*path}", (_req, res) =>
      res.sendFile(resolve(options.staticDirectory!, "index.html")),
    );
  }
  app.use(
    (
      error: unknown,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      if (error instanceof DomainError) return res.status(400).json({error: error.message});
      if (error instanceof z.ZodError)
        return res
          .status(400)
          .json({
            error: error.issues[0]?.message || "Confira os dados informados.",
          });
      if (error instanceof multer.MulterError)
        return res
          .status(400)
          .json({ error: "Envie apenas um arquivo PDF ou TXT de até 15 MB." });
      if (error instanceof SyntaxError)
        return res.status(400).json({ error: "Requisição inválida." });
      res
        .status(500)
        .json({
          error: "Não foi possível concluir a operação. Tente novamente.",
        });
    },
  );
  return { app, store };
}
