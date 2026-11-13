import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import * as kernel from "./index.js";
import * as application from "./application.js";

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(here, "../..");
const repoRoot = join(here, "../../..");

const SURFACE_SIZE = 370;
const APPLICATION_SIZE = 29;
const ALLOWED_SUBPATHS = ["application"];
const ENTRY_FILES = ["index.ts", "application.ts"];

const read = (path: string): string => readFileSync(path, "utf8");

const exportedNames = (source: string): string[] =>
  [...source.matchAll(/^export(?: type)? \{([^}]*)\} from/gm)]
    .flatMap((match) => match[1].split(","))
    .map((name) => name.trim().split(/\s+as\s+/).pop() ?? "")
    .filter((name) => name.length > 0);

const typescriptFiles = (dir: string): string[] => {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === "node_modules" || entry.name === "dist" || entry.name === ".git") return [];
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return typescriptFiles(full);
    return entry.name.endsWith(".ts") ? [full] : [];
  });
};

describe("kernel surface conformance", () => {
  it("declares every export explicitly, never with a wildcard", () => {
    for (const entry of ENTRY_FILES) {
      const source = read(join(here, entry));
      expect(source, `${entry} must not use export *`).not.toMatch(/^export \*/m);
    }
  });

  it("locks the size of each entry point", () => {
    expect(exportedNames(read(join(here, "index.ts")))).toHaveLength(SURFACE_SIZE);
    expect(exportedNames(read(join(here, "application.ts")))).toHaveLength(APPLICATION_SIZE);
  });

  it("exports no aggregate state shapes and no duplicate names", () => {
    const names = exportedNames(read(join(here, "index.ts")));
    expect(names.filter((name) => name.endsWith("Props"))).toEqual([]);
    expect(names.filter((name, index) => names.indexOf(name) !== index)).toEqual([]);
  });

  it("disambiguates the names that exist in more than one context", () => {
    const names = exportedNames(read(join(here, "index.ts")));
    expect(names).toEqual(
      expect.arrayContaining([
        "TransactionHash",
        "SettlementTransactionHash",
        "ConfirmationCount",
        "SettlementConfirmationCount",
        "DueDate",
        "WorkflowDueDate"
      ])
    );
  });

  it("re-exports through the entry points at runtime", () => {
    expect(kernel.Result).toBeTypeOf("function");
    expect(kernel.Invoice).toBeTypeOf("function");
    expect(kernel.Money).toBeTypeOf("function");
    expect(kernel.SettlementTransactionHash).toBeTypeOf("function");
    expect(kernel.issueInvoice).toBeTypeOf("function");
    expect(kernel.recordPayment).toBeTypeOf("function");
    expect(kernel.submitPayment).toBeTypeOf("function");
    expect(kernel.startPaymentProcessing).toBeTypeOf("function");
    expect(kernel.confirmPayment).toBeTypeOf("function");
    expect(kernel.failPayment).toBeTypeOf("function");
    expect(application.Mediator).toBeTypeOf("function");
  });

  it("declares exactly two entry points, none of them a wildcard", () => {
    const pkg = JSON.parse(read(join(packageRoot, "package.json"))) as {
      exports: Record<string, string>;
    };
    const keys = Object.keys(pkg.exports).sort();
    expect(keys).toEqual([".", "./application", "./package.json"]);
    expect(keys.filter((key) => key.includes("*"))).toEqual([]);

    for (const [key, target] of Object.entries(pkg.exports)) {
      expect(existsSync(join(packageRoot, target)), `${key} → ${target} must exist`).toBe(true);
    }
  });

  it("keeps consumers on the declared entry points", () => {
    const offenders: string[] = [];
    const specifier = /from\s+"(acos-backend\/[^"]*)"/g;

    for (const root of ["products", "runtime"]) {
      for (const file of typescriptFiles(join(repoRoot, root))) {
        for (const match of read(file).matchAll(specifier)) {
          const subpath = match[1].slice("acos-backend/".length);
          if (!ALLOWED_SUBPATHS.includes(subpath)) {
            offenders.push(`${relative(repoRoot, file)} → ${match[1]}`);
          }
        }
      }
    }

    expect(offenders).toEqual([]);
  });

  it("reaches backend sources only through the declared entry points", () => {
    const offenders: string[] = [];
    const deepSpecifier =
      /(?:\bfrom\s+|\bimport\(\s*)["']([^"']*backend\/src\/[^"']*)["']/g;

    for (const root of ["products", "runtime"]) {
      for (const file of typescriptFiles(join(repoRoot, root))) {
        for (const match of read(file).matchAll(deepSpecifier)) {
          offenders.push(`${relative(repoRoot, file)} → ${match[1]}`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });

  it("does not reopen deep resolution through a tsconfig path wildcard", () => {
    for (const config of ["products/merchant/tsconfig.json", "runtime/tsconfig.json"]) {
      const path = join(repoRoot, config);
      if (!existsSync(path)) continue;
      const paths = (JSON.parse(read(path)) as { compilerOptions?: { paths?: object } })
        .compilerOptions?.paths ?? {};
      expect(Object.keys(paths), `${config} must not map acos-backend/*`).not.toContain(
        "acos-backend/*"
      );
    }
  });
});
