import { importProduct } from "../src/lib/catalog";
import { MOCK_CATALOG } from "../src/lib/suppliers/mock";

async function main() {
  for (const p of MOCK_CATALOG) {
    await importProduct("mock", p.supplierProductId);
    console.log("Imported", p.title);
  }
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
