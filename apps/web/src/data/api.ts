import { createClient } from "@neondatabase/neon-js";

const neon = createClient({
  auth: {
    url: "https://ep-calm-dew-b6iftb46.neonauth.c-2.sa-east-1.aws.neon.tech/neondb/auth",
    allowAnonymous: true,
  },
  dataApi: {
    url: "https://ep-calm-dew-b6iftb46.apirest.c-2.sa-east-1.aws.neon.tech/neondb/rest/v1",
  },
});

type ApiError = Error & { status?: number };
type WorkspaceRow = {
  collection: string;
  id: string;
  data: unknown;
  updatedAt: string;
};

async function unwrap<T>(
  result: PromiseLike<{ data: unknown; error: { message: string; code?: string } | null }>,
): Promise<T> {
  const { data, error } = await result;
  if (error) {
    const apiError = new Error(error.message) as ApiError;
    apiError.status = error.code === "42501" ? 403 : 500;
    window.dispatchEvent(
      new CustomEvent("rgr-api-error", { detail: apiError.message }),
    );
    throw apiError;
  }
  return data as T;
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const body = init.body
    ? JSON.parse(String(init.body)) as Record<string, unknown>
    : undefined;
  const workspacePath = path.match(
    /^\/api\/workspace\/([^/]+)\/([^/]+)$/,
  );
  const leadPath = path.match(/^\/api\/leads\/([^/]+)(?:\/status)?$/);

  if (path === "/api/workspace" && method === "GET") {
    return unwrap<T>(
      neon.from("workspace_records")
        .select("collection,id,data")
        .order("collection", { ascending: true })
        .order("createdAt", { ascending: true }),
    );
  }

  if (workspacePath && method === "PUT" && body) {
    const [, collection, encodedId] = workspacePath;
    const row: WorkspaceRow = {
      collection: decodeURIComponent(collection),
      id: decodeURIComponent(encodedId),
      data: body,
      updatedAt: new Date().toISOString(),
    };
    await unwrap(
      neon.from("workspace_records")
        .upsert(row, { onConflict: "collection,id" }),
    );
    return undefined as T;
  }

  if (workspacePath && method === "DELETE") {
    const [, collection, encodedId] = workspacePath;
    await unwrap(
      neon.from("workspace_records")
        .delete()
        .eq("collection", decodeURIComponent(collection))
        .eq("id", decodeURIComponent(encodedId)),
    );
    return undefined as T;
  }

  if (path === "/api/leads" && method === "GET") {
    return unwrap<T>(
      neon.from("leads")
        .select("*")
        .order("date", { ascending: false })
        .limit(200),
    );
  }

  if (path === "/api/leads" && method === "POST" && body) {
    const row = {
      ...body,
      id: crypto.randomUUID(),
      date: body.date ?? new Date().toISOString(),
      ownerId: null,
      updatedAt: new Date().toISOString(),
    };
    const rows = await unwrap<Array<T>>(
      neon.from("leads").insert(row).select("*"),
    );
    return rows[0];
  }

  if (leadPath && method === "DELETE") {
    await unwrap(
      neon.from("leads")
        .delete()
        .eq("id", decodeURIComponent(leadPath[1])),
    );
    return undefined as T;
  }

  if (leadPath && method === "PATCH" && body) {
    const id = decodeURIComponent(leadPath[1]);
    const updatedAt = new Date().toISOString();
    const update = {
      ...body,
      updatedAt,
      ...(path.endsWith("/status") && body.status === "contacted"
        ? { contactedAt: updatedAt }
        : {}),
    };
    const rows = await unwrap<Array<T>>(
      neon.from("leads").update(update).eq("id", id).select("*"),
    );
    return rows[0];
  }

  if (path === "/api/reports/latest" && method === "GET") {
    const rows = await unwrap<T[]>(
      neon.from("weekly_reports")
        .select("*")
        .order("weekStarting", { ascending: false })
        .limit(1),
    );
    return (rows[0] ?? null) as T;
  }

  if (path === "/api/reports" && method === "POST" && body) {
    const row = {
      ...body,
      id: crypto.randomUUID(),
      weekStarting: new Date(String(body.weekStarting)).toISOString(),
    };
    const rows = await unwrap<Array<T>>(
      neon.from("weekly_reports")
        .upsert(row, { onConflict: "weekStarting" })
        .select("*"),
    );
    return rows[0];
  }

  const error = new Error(`Ruta no soportada: ${method} ${path}`) as ApiError;
  error.status = 404;
  throw error;
}
