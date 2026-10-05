import { spawn } from "node:child_process";

const npmCli = process.env.npm_execpath;
if (!npmCli) {
  throw new Error("npm no proporcionó la ruta de su CLI; inicia con `npm run dev`.");
}

const processes = [
  ["API", "@rgr/api"],
  ["Web", "@rgr/web"],
].map(([name, workspace]) => {
  const child = spawn(
    process.execPath,
    [npmCli, "run", "dev", "--workspace", workspace],
    { cwd: process.cwd(), env: process.env, stdio: "inherit" },
  );
  child.on("error", (error) => {
    console.error(`[${name}] No se pudo iniciar:`, error);
    stop(1);
  });
  child.on("exit", (code) => {
    if (!stopping) {
      console.error(`[${name}] terminó${code === 0 ? "" : ` con código ${code}`}.`);
      stop(code || 1);
    }
  });
  return child;
});

let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of processes) {
    if (child.exitCode === null) child.kill("SIGTERM");
  }
  process.exitCode = code;
}

process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());
