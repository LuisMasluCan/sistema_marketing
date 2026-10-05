import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { router } from "./OperationsApp";
import { RouterProvider } from "@tanstack/react-router";
import {
  apiRequest,
  createFirstAdmin,
  login,
  logout,
  restoreSession,
  type ApiSession,
} from "./data/api";
import { useUiStore } from "./store";
import { hydrateWorkspace } from "./data/static";
import "./App.css";

type CurrentUser = ApiSession["user"];

export default function App() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const setSessionUser = useUiStore((state) => state.setSessionUser);
  const [setupRequired, setSetupRequired] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void restoreSession()
      .then(async (sessionUser) => {
        if (!active) return;
        if (sessionUser) {
          await hydrateWorkspace();
          setUser(sessionUser);
          return;
        }
        const result = await apiRequest<{ setupRequired: boolean }>(
          "/api/auth/setup-required",
          {},
          false,
        );
        if (active) setSetupRequired(result.setupRequired);
      })
      .catch(async (sessionError: unknown) => {
        const status = (sessionError as Error & { status?: number }).status;
        if (status !== 401) {
          if (active) {
            setError(
              sessionError instanceof Error
                ? sessionError.message
                : "No se pudo conectar con el API",
            );
          }
          return;
        }
        try {
          const result = await apiRequest<{ setupRequired: boolean }>(
            "/api/auth/setup-required",
            {},
            false,
          );
          if (active) setSetupRequired(result.setupRequired);
        } catch (setupError) {
          if (active) {
            setError(
              setupError instanceof Error
                ? setupError.message
                : "No se pudo conectar con el API",
            );
          }
        }
      })
      .finally(() => {
        if (active) setChecking(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setSessionUser(user);
  }, [setSessionUser, user]);

  useEffect(() => {
    const handleLogout = () => {
      void logout()
        .catch((logoutError: unknown) => {
          setError(
            logoutError instanceof Error
              ? logoutError.message
              : "No se pudo cerrar la sesión correctamente",
          );
        })
        .finally(() => setUser(null));
    };
    window.addEventListener("rgr-logout", handleLogout);
    return () => window.removeEventListener("rgr-logout", handleLogout);
  }, []);

  if (checking) return <AuthMessage>Conectando con el sistema…</AuthMessage>;
  if (error && !user) {
    return (
      <AuthMessage>
        <strong>No se pudo conectar</strong>
        <span>{error}</span>
        <span>Verifica que el API esté iniciado y vuelve a cargar esta página.</span>
      </AuthMessage>
    );
  }
  if (!user) {
    return (
      <AuthScreen
        setupRequired={setupRequired}
        onAuthenticated={(nextUser) => {
          void hydrateWorkspace()
            .then(() => {
              setError("");
              setUser(nextUser);
            })
            .catch((hydrateError: unknown) => {
              setError(
                hydrateError instanceof Error
                  ? hydrateError.message
                  : "No se pudieron cargar los datos del espacio de trabajo",
              );
            });
        }}
      />
    );
  }
  return <RouterProvider router={router} />;
}

function AuthMessage({ children }: { children: ReactNode }) {
  return <main className="auth-page"><section className="auth-card auth-message">{children}</section></main>;
}

function AuthScreen({
  setupRequired,
  onAuthenticated,
}: {
  setupRequired: boolean;
  onAuthenticated: (user: CurrentUser) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const account = setupRequired
        ? await createFirstAdmin(name, email, password)
        : await login(email, password);
      onAuthenticated(account);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo iniciar sesión");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="eyebrow">RGR · OPERACIONES</p>
        <h1>{setupRequired ? "Crear cuenta administradora" : "Iniciar sesión"}</h1>
        <p className="auth-description">
          {setupRequired
            ? "Esta es la primera cuenta y tendrá acceso de administración."
            : "Ingresa para continuar con las operaciones de marketing."}
        </p>
        <form onSubmit={(event) => void submit(event)} className="auth-form">
          {setupRequired && (
            <label className="form-field">
              <span>Nombre</span>
              <input required minLength={2} maxLength={120} value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
            </label>
          )}
          <label className="form-field">
            <span>Correo electrónico</span>
            <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
          </label>
          <label className="form-field">
            <span>Contraseña {setupRequired && "(mínimo 12 caracteres)"}</span>
            <input required minLength={12} maxLength={128} type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={setupRequired ? "new-password" : "current-password"} />
          </label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="button button-primary auth-submit" type="submit" disabled={submitting}>
            {submitting ? "Un momento…" : setupRequired ? "Crear cuenta y entrar" : "Entrar"}
          </button>
        </form>
      </section>
    </main>
  );
}
