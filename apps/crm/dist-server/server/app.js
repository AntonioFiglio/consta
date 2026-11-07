import express from "express";
import multer from "multer";
import { createHash, randomBytes, timingSafeEqual, } from "node:crypto";
import { z } from "zod";
import { resolve } from "node:path";
import { assetInput, maintenanceDocumentInput, coverageDatesInput, updateCoverageDates, DomainError, eventsFor, occurrence, prepareAsset, validDate, } from "./domain.js";
import { aiReady, extractContract } from "./extraction.js";
import { breakdownInput, updateBreakdown } from "./breakdowns.js";
import { contractFile } from "./contract-file.js";
import { createStore } from "./store.js";
import { createContractBriefService, ContractBriefError } from "./contract-summary.js";
export function createApp(options) {
    const store = createStore(options.database, options.seed);
    const getContractBrief = createContractBriefService(store);
    const app = express();
    const sessions = new Map();
    const attempts = new Map();
    const extracting = new Set();
    const upload = multer({
        storage: multer.memoryStorage(),
        limits: { fileSize: 15 * 1024 * 1024, files: 1, fields: 0 },
    });
    const maintenanceUpload = multer({
        storage: multer.memoryStorage(),
        limits: {
            fileSize: 15 * 1024 * 1024,
            files: 1,
            fields: 2,
            fieldSize: 20000,
        },
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
    app.use(express.json({ limit: "1mb" }));
    const authenticated = (cookie) => {
        if (!options.password)
            return true;
        const token = cookie
            ?.split(";")
            .map((item) => item.trim())
            .find((item) => item.startsWith("consta_session="))
            ?.slice(15);
        if (!token)
            return false;
        const expiry = sessions.get(token);
        if (!expiry || expiry < Date.now()) {
            sessions.delete(token);
            return false;
        }
        return true;
    };
    app.get("/api/config", (req, res) => res.json({
        aiReady: aiReady(),
        authenticated: authenticated(req.get("cookie")),
        passwordRequired: Boolean(options.password),
        mode: options.password ? "local-protected" : "local-demo",
    }));
    app.post("/api/login", (req, res) => {
        const key = req.ip || "local";
        let attempt = attempts.get(key);
        if (!attempt || Date.now() - attempt.since > 300000) {
            attempt = { count: 0, since: Date.now() };
            attempts.set(key, attempt);
        }
        if (attempt.count >= 10)
            return res.status(429).json({
                error: "Muitas tentativas. Tente novamente em cinco minutos.",
            });
        const supplied = typeof req.body?.password === "string" ? req.body.password : "";
        const digest = (value) => createHash("sha256").update(value).digest();
        if (options.password &&
            !timingSafeEqual(digest(supplied), digest(options.password))) {
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
        if (token)
            sessions.delete(token);
        res.clearCookie("consta_session", { path: "/api" }).json({ ok: true });
    });
    app.use("/api", (req, res, next) => authenticated(req.get("cookie"))
        ? next()
        : res.status(401).json({
            error: "Entre novamente para acessar os cadastros e contratos.",
        }));
    app.get("/api/assets", (_req, res) => res.json(store.listAssets()));
    app.patch("/api/assets/:id/maintenance-responsibility", (req, res) => {
        const { maintenanceProvider } = z
            .object({
            maintenanceProvider: z.enum(["contract", "internal", "unassigned"]),
        })
            .strict()
            .parse(req.body);
        const existing = store
            .listAssets()
            .find((asset) => asset.id === req.params.id);
        if (!existing)
            return res.status(404).json({ error: "Equipamento não encontrado." });
        res.json(store.saveAsset({
            ...existing,
            maintenanceProvider,
            updatedAt: new Date().toISOString(),
        }));
    });
    app.patch("/api/assets/:id/coverages/:coverageId/dates", (req, res) => {
        const dates = coverageDatesInput.parse(req.body);
        const existing = store
            .listAssets()
            .find((asset) => asset.id === req.params.id);
        if (!existing)
            return res.status(404).json({ error: "Equipamento não encontrado." });
        res.json(store.saveAsset(updateCoverageDates(existing, req.params.coverageId, dates)));
    });
    app.get("/api/events", (req, res) => {
        const from = String(req.query.from || "");
        const to = String(req.query.to || "");
        if (!validDate(from) ||
            !validDate(to) ||
            from > to ||
            to > occurrence(from, 2, "years", 1))
            return res.status(400).json({
                error: "Informe um intervalo de consulta válido de até dois anos.",
            });
        res.json(eventsFor(store.listAssets(), from, to));
    });
    const saveAsset = (req, res) => {
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
        if (store
            .listAssets()
            .some((asset) => asset.id !== existing?.id &&
            asset.patrimony.toLocaleUpperCase("pt-BR") ===
                input.patrimony.toLocaleUpperCase("pt-BR")))
            return res.status(409).json({
                error: "Este número de tombamento já está cadastrado. Abra o cadastro existente para editar.",
            });
        res
            .status(existing ? 200 : 201)
            .json(store.saveAsset(prepareAsset(existing, input)));
    };
    app.post("/api/assets", saveAsset);
    app.post("/api/assets/batch", (req, res) => {
        const input = z
            .object({
            existingId: z.string().uuid().optional(),
            assets: z
                .array(assetInput.and(z.object({
                id: z.string().uuid().optional(),
                renew: z.boolean().optional(),
            })))
                .min(1)
                .max(50),
        })
            .parse(req.body);
        const all = store.listAssets();
        const entries = input.assets.map((entry, index) => ({
            ...entry,
            id: entry.id || (index === 0 ? input.existingId : undefined),
        }));
        const ids = entries
            .map((entry) => entry.id)
            .filter((id) => Boolean(id));
        if (new Set(ids).size !== ids.length)
            throw new DomainError("O mesmo equipamento aparece mais de uma vez na lista.");
        if (ids.some((id) => !all.some((asset) => asset.id === id)))
            throw new DomainError("Um dos equipamentos não foi encontrado.");
        const known = new Set(all
            .filter((asset) => !ids.includes(asset.id))
            .map((asset) => asset.patrimony.toLocaleUpperCase("pt-BR")));
        for (const entry of entries) {
            const key = entry.patrimony.toLocaleUpperCase("pt-BR");
            if (known.has(key))
                throw new DomainError(`O número de tombamento ${entry.patrimony} já está cadastrado ou foi repetido.`);
            known.add(key);
            if (entry.contractId && !store.getContract(entry.contractId))
                throw new DomainError("Contrato não encontrado.");
        }
        const updated = entries.map(({ id, renew, ...data }) => prepareAsset(id ? all.find((asset) => asset.id === id) : undefined, data, renew === true));
        res.status(201).json(store.saveAssets(updated));
    });
    app.patch("/api/assets/:id/breakdown", (req, res) => {
        const asset = store.listAssets().find((item) => item.id === req.params.id);
        if (!asset)
            return res.status(404).json({ error: "Equipamento não encontrado." });
        res.json(store.saveAsset(updateBreakdown(asset, breakdownInput.parse(req.body))));
    });
    app.post("/api/assets/:id/contracts", (req, res) => {
        const { additionalAssetIds = [], ...body } = req.body || {};
        const ids = z.array(z.string().uuid()).max(49).parse(additionalAssetIds);
        const input = assetInput.parse(body);
        if (!input.contractId || !store.getContract(input.contractId))
            throw new DomainError("Envie o novo contrato antes de salvar.");
        const existing = store.listAssets();
        const targetIds = [...new Set([String(req.params.id), ...ids])];
        const updated = targetIds.map((id) => {
            const asset = existing.find((asset) => asset.id === id);
            if (!asset)
                throw new DomainError("Um dos equipamentos selecionados não foi encontrado.");
            return prepareAsset(asset, id === req.params.id
                ? input
                : {
                    ...input,
                    name: asset.name,
                    brand: asset.brand,
                    model: asset.model,
                    patrimony: asset.patrimony,
                    serial: asset.serial,
                    sector: asset.sector,
                    notes: asset.notes,
                }, true);
        });
        const patrimonies = new Set();
        for (const asset of [
            ...existing.filter((asset) => !targetIds.includes(asset.id)),
            ...updated,
        ]) {
            const key = asset.patrimony.toLocaleUpperCase("pt-BR");
            if (patrimonies.has(key))
                throw new DomainError("Este número de tombamento já pertence a outro equipamento.");
            patrimonies.add(key);
        }
        res.json(store.saveAssets(updated));
    });
    app.put("/api/assets/:id", saveAsset);
    app.post("/api/contracts", upload.single("file"), (req, res) => {
        const file = contractFile(req.file);
        res.status(201).json(store.upload(file.name, file.mime, file.bytes));
    });
    app.post("/api/assets/:id/maintenance-documents", maintenanceUpload.single("file"), async (req, res) => {
        const assetId = z.string().parse(req.params.id);
        if (!store.listAssets().some((asset) => asset.id === assetId))
            return res.status(404).json({ error: "Equipamento não encontrado." });
        const input = maintenanceDocumentInput.parse(req.body);
        const file = contractFile(req.file);
        let extraction;
        if (aiReady()) {
            if (extracting.size)
                return res
                    .status(409)
                    .json({
                    error: "Já existe uma leitura em andamento. Aguarde e tente novamente.",
                });
            const job = `maintenance:${assetId}`;
            extracting.add(job);
            try {
                extraction = await extractContract(file.bytes, file.name, file.mime);
            }
            catch {
                return res
                    .status(502)
                    .json({
                    error: "Não foi possível ler o documento. Tente novamente. O vínculo de manutenção não foi alterado.",
                });
            }
            finally {
                extracting.delete(job);
            }
        }
        res
            .status(201)
            .json(store.attachMaintenanceDocument(assetId, file, input, extraction));
    });
    app.get("/api/contracts", (_req, res) => res.json(store.listContracts()));
    app.patch("/api/contracts/:id/parent", (req, res) => {
        const { parentContractId, documentKind } = z
            .object({
            parentContractId: z.string().uuid().nullable(),
            documentKind: z
                .enum(["amendment", "outsourced", "complement"])
                .optional(),
        })
            .strict()
            .parse(req.body);
        if (!store.getContract(req.params.id))
            return res.status(404).json({ error: "Arquivo não encontrado." });
        const { extraction: _extraction, ...summary } = store.setContractParent(req.params.id, parentContractId, documentKind);
        res.json(summary);
    });
    app.get("/api/contracts/:id", (req, res) => {
        const contract = store.getContract(req.params.id);
        if (!contract)
            return res.status(404).json({ error: "Contrato não encontrado." });
        res.json(contract);
    });
    app.post("/api/contracts/:id/summary", async (req, res) => {
        const { retry } = z.object({ retry: z.boolean().optional().default(false) }).strict().parse(req.body || {});
        try {
            res.json(await getContractBrief(String(req.params.id), retry));
        }
        catch (error) {
            if (error instanceof ContractBriefError)
                return res.status(error.status).json({ error: error.message });
            throw error;
        }
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
            return res.status(503).json({
                error: "Leitura por IA ainda não configurada. Você pode preencher os dados manualmente.",
            });
        if (extracting.size)
            return res.status(409).json({
                error: "Já existe uma leitura em andamento. Aguarde e tente novamente.",
            });
        extracting.add(contract.id);
        try {
            res.json(store.saveExtraction(contract.id, await extractContract(bytes, contract.name, contract.mime)));
        }
        catch {
            res.status(502).json({
                error: "Não foi possível ler o contrato. Confira a configuração do provedor ou tente novamente. Seu arquivo foi preservado e o cadastro manual continua disponível.",
            });
        }
        finally {
            extracting.delete(contract.id);
        }
    });
    app.use("/api", (_req, res) => res.status(404).json({ error: "Recurso não encontrado." }));
    if (options.staticDirectory) {
        app.use(express.static(resolve(options.staticDirectory)));
        app.get("/{*path}", (_req, res) => res.sendFile(resolve(options.staticDirectory, "index.html")));
    }
    app.use((error, _req, res, _next) => {
        if (error instanceof DomainError)
            return res.status(400).json({ error: error.message });
        if (error instanceof z.ZodError)
            return res.status(400).json({
                error: error.issues[0]?.message || "Confira os dados informados.",
            });
        if (error instanceof multer.MulterError)
            return res
                .status(400)
                .json({ error: "Envie apenas um arquivo PDF ou TXT de até 15 MB." });
        if (error instanceof SyntaxError)
            return res.status(400).json({ error: "Requisição inválida." });
        res.status(500).json({
            error: "Não foi possível concluir a operação. Tente novamente.",
        });
    });
    return { app, store };
}
