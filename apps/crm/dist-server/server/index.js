import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { existsSync } from "node:fs";
import { createApp } from "./app.js";
config({ path: ".env.local", quiet: true });
const staticDirectory = resolve("dist");
const { app, store } = createApp({
    database: process.env.DATABASE_PATH || resolve(".data/consta.sqlite"),
    password: process.env.APP_PASSWORD || undefined,
    seed: process.env.SEED_DEMO !== "false",
    staticDirectory: existsSync(staticDirectory) ? staticDirectory : undefined,
});
const port = Number(process.env.PORT || 3007);
const server = app.listen(port, "127.0.0.1", () => console.log(`CONSTA API local: http://127.0.0.1:${port} • ${fileURLToPath(import.meta.url).includes("dist-server") ? "produção local" : "desenvolvimento"}`));
for (const signal of ["SIGINT", "SIGTERM"])
    process.once(signal, () => server.close(() => {
        store.close();
        process.exit(0);
    }));
