import { cjAdapter } from "./cj";
import { mockAdapter } from "./mock";
import type { SupplierAdapter } from "./types";

const adapters: Record<string, SupplierAdapter> = {
  cj: cjAdapter,
  mock: mockAdapter,
};

export const SUPPLIERS = Object.keys(adapters);

export function getSupplier(name: string): SupplierAdapter {
  const a = adapters[name];
  if (!a) throw new Error(`Unknown supplier "${name}"`);
  return a;
}
