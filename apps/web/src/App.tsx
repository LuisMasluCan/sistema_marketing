import { useEffect, useState } from "react";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./OperationsApp";
import { hydrateWorkspace } from "./data/static";
import { useUiStore } from "./store";

function ConnectionMessage({ message }: { message: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <section className="max-w-lg rounded-xl border border-red-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900">
          No se pudo conectar a Neon
        </h1>
        <p className="mt-2 text-sm text-slate-600">{message}</p>
        <button
          className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          onClick={() => window.location.reload()}
          type="button"
        >
          Volver a intentar
        </button>
      </section>
    </main>
  );
}

export default function App() {
  const setSessionUser = useUiStore((state) => state.setSessionUser);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSessionUser({
      id: "local-admin",
      name: "Administrador",
      email: "",
      role: "ADMIN",
    });

    void hydrateWorkspace()
      .then(() => setReady(true))
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : String(cause));
      });
  }, [setSessionUser]);

  if (error) return <ConnectionMessage message={error} />;
  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Conectando con la base de datos...
      </main>
    );
  }

  return <RouterProvider router={router} />;
}
