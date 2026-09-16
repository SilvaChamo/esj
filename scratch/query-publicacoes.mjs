import { createClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

function loadEnvLocal() {
  const p = resolve(".env.local");
  if (!existsSync(p)) return {};
  const out = {};
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].trim();
  }
  return out;
}

const envLocal = loadEnvLocal();

// Prefer .env.local, fall back to next.config.js defaults
const URL =
  envLocal.NEXT_PUBLIC_SUPABASE_URL ||
  "https://tsozqadxoujocwxqxorg.supabase.co";
const ANON_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzb3pxYWR4b3Vqb2N3eHF4b3JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyNTMwNTAsImV4cCI6MjEwNDgyOTA1MH0.RXebycS3ngNsbXxzNZuv8SbgKVNBm_1XnikWZiigp78";
const PUB =
  envLocal.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_J5j1drDwSckQFZSdEPSbIQ_3yzT-8Tb";
const ANON_FROM_ENV = envLocal.NEXT_PUBLIC_SUPABASE_ANON_KEY || ANON_JWT;

function printRows(label, data, error) {
  console.log("\n=== " + label + " ===");
  if (error) {
    console.log("ERROR:", JSON.stringify(error, null, 2));
    return;
  }
  console.log("count:", data?.length ?? 0);
  for (const row of data || []) {
    console.log(
      JSON.stringify({
        id: row.id,
        title: row.title,
        image: row.image == null ? null : String(row.image).slice(0, 80),
        categoria: row.categoria,
        destaque: row.destaque,
      })
    );
  }
  console.log("RAW_DATA:", JSON.stringify(data, null, 2));
}

async function run(label, client) {
  const { data, error } = await client
    .from("publicacoes")
    .select("id, title, image, categoria, destaque")
    .in("categoria", ["livro", "evento"])
    .order("categoria")
    .order("destaque", { ascending: false });
  printRows(label, data, error);
}

console.log("URL:", URL);
console.log(".env.local ANON starts with:", String(ANON_FROM_ENV).slice(0, 20));
console.log("next.config JWT starts with:", ANON_JWT.slice(0, 20));
console.log("PUB:", PUB.slice(0, 30));

await run("createClient + next.config ANON JWT", createClient(URL, ANON_JWT));

try {
  await run(
    "createClient + .env.local ANON_KEY value",
    createClient(URL, ANON_FROM_ENV)
  );
} catch (e) {
  console.log("\ncreateClient+.env.local ANON threw:", e.message);
}

try {
  await run("createClient + PUBLISHABLE", createClient(URL, PUB));
} catch (e) {
  console.log("\ncreateClient+PUB threw:", e.message);
}

try {
  await run(
    "createBrowserClient + next.config ANON JWT",
    createBrowserClient(URL, ANON_JWT)
  );
} catch (e) {
  console.log("\ncreateBrowserClient threw:", e.message);
}

try {
  await run(
    "createBrowserClient + PUBLISHABLE",
    createBrowserClient(URL, PUB)
  );
} catch (e) {
  console.log("\ncreateBrowserClient+PUB threw:", e.message);
}
