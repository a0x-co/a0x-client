import "server-only";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  console.log("[GET][cookies]");
  // Obtiene todas las cookies disponibles
  const account = cookies().get("account");
  const accountParsed = account ? JSON.parse(account.value) : null;

  // Devuelve las cookies en formato JSON
  return NextResponse.json({ account: accountParsed });
}
