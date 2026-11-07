import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const copies = JSON.parse(readFileSync(new URL("../static-copies.json", import.meta.url), "utf8"));
const source = fileURLToPath(new URL(`../${copies.pitch}/`, import.meta.url));
const publicDirectory = fileURLToPath(new URL("../public/", import.meta.url));
const destination = resolve(publicDirectory, "pitch");

// O pitch é copiado sem transformar HTML, CSS, scripts, fontes ou demonstrações.
rmSync(destination, { recursive: true, force: true });
mkdirSync(publicDirectory, { recursive: true });
cpSync(source, destination, { recursive: true, filter: (path) => !path.endsWith(".DS_Store") });

// Os HTMLs de apoio também apontam para documentos públicos fora de /pitch.
for (const file of readdirSync(source).filter((name) => name.endsWith(".html"))) {
  const html = readFileSync(resolve(source, file), "utf8");
  for (const [, href] of html.matchAll(/(?:href|src)=["'](\.\.\/[^"']+)["']/g)) {
    const path = resolve(source, decodeURIComponent(href.split(/[?#]/)[0]));
    const fromRoot = relative(root, path);
    if (fromRoot.startsWith("..") || isAbsolute(fromRoot) || !existsSync(path)) {
      throw new Error(`Referência de apoio inválida no pitch: ${href}`);
    }
    const target = resolve(publicDirectory, fromRoot);
    mkdirSync(dirname(target), { recursive: true });
    cpSync(path, target);
  }
}
console.log("Pitch HTML e dependências copiados para a landing: /pitch/deck.html#b=0");
