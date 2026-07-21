import { apiError } from "@fokuna/api-contracts";
import { NextResponse } from "next/server";
import type { ZodType } from "zod";

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function jsonError(status: number, code: string, message: string, details?: unknown) {
  return NextResponse.json(apiError(code, message, details), { status });
}

export async function parseJson<T>(request: Request, schema: ZodType<T>): Promise<T> {
  const body: unknown = await request.json();
  return schema.parse(body);
}

export function handleRouteError(error: unknown) {
  if (error instanceof Response) {
    return error;
  }

  if (error && typeof error === "object" && "name" in error && error.name === "ZodError") {
    return jsonError(400, "validation_error", "Ungültige Anfrage", error);
  }

  console.error(error);
  return jsonError(500, "internal_error", "Unerwarteter Fehler");
}
