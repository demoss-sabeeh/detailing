import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const functionDir = path.resolve(".vercel/output/functions/__server.func");
const libsDir = path.join(functionDir, "_libs");
const helperPath = path.join(libsDir, "tslib.mjs");

await mkdir(libsDir, { recursive: true });

await writeFile(
  helperPath,
  `export function __assign(target, ...sources) {
  return Object.assign(target, ...sources);
}

export function __rest(source, excluded) {
  const result = {};
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key) && !excluded.includes(key)) {
      result[key] = source[key];
    }
  }
  return result;
}

export function __spreadArray(to, from, pack) {
  if (pack || (typeof to.push === "function" && from.length <= 0)) {
    return to.push(...from), to;
  }
  return [...to, ...from];
}

export function __awaiter(_this, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P((resolve) => resolve(value));
  }
  function fulfilled(value) {
    try { step(generator().next(value)); } catch (error) { reject(error); }
  }
  function rejected(value) {
    try { step(generator().throw(value)); } catch (error) { reject(error); }
  }
  function step(result) {
    result.done
      ? resolve(adopt(result.value))
      : adopt(result.value).then(fulfilled, rejected);
  }
  let resolve;
  let reject;
  const promise = new P((res, rej) => {
    resolve = res;
    reject = rej;
  });
  step(generator().next());
  return promise;
}
`,
);

async function patchDirectory(directory) {
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await patchDirectory(filePath);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith(".mjs")) continue;

    const source = await readFile(filePath, "utf8");
    if (!source.includes('from "tslib"')) continue;

    let relative = path.relative(path.dirname(filePath), helperPath).replaceAll("\\", "/");
    if (!relative.startsWith(".")) relative = `./${relative}`;

    const patched = source.replace(
      /import\s*\{\s*([^}]+)\s*\}\s*from\s*"tslib";/g,
      (_match, names) => `import { ${names.trim()} } from "${relative}";`,
    );
    await writeFile(filePath, patched);
  }
}

await patchDirectory(functionDir);
