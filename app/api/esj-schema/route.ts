import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const file = path.join(process.cwd(), "supabase", "schema.sql");
  const sql = await readFile(file, "utf8");
  return new NextResponse(sql, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
