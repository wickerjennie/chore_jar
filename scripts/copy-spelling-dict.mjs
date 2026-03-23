import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, "node_modules", "dictionary-en");
const destDir = join(root, "public", "spelling-en");

const affSrc = join(srcDir, "index.aff");
const dicSrc = join(srcDir, "index.dic");

if (!existsSync(affSrc) || !existsSync(dicSrc)) {
  console.warn(
    "copy-spelling-dict: dictionary-en files missing (run npm install). Spelling suggestions will fail until then.",
  );
  process.exit(0);
}

mkdirSync(destDir, { recursive: true });
copyFileSync(affSrc, join(destDir, "index.aff"));
copyFileSync(dicSrc, join(destDir, "index.dic"));
