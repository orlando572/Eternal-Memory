import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

type GitReader = (args: string[]) => string;

const commitShaPattern = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i;
const taskReferencePattern = /(?:^|[^\p{L}\p{N}_#-])#?TSK-(?:0[1-9]|[1-9]\d+)(?![\p{L}\p{N}_-])/u;

export function hasTaskReference(message: string): boolean {
  return taskReferencePattern.test(message);
}

function readGit(args: string[]): string {
  return execFileSync("git", args, {
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
}

export function validateTaskCommits(
  baseSha: string | undefined,
  headSha: string | undefined,
  runGit: GitReader = readGit,
): { checked: number; invalid: string[] } {
  if (!baseSha || !headSha || !commitShaPattern.test(baseSha) || !commitShaPattern.test(headSha)) {
    throw new Error("Define PR_BASE_SHA y PR_HEAD_SHA con los SHA completos de la base y cabeza del PR.");
  }

  // Excluye los commits ya presentes en la base y el merge sintético de Actions.
  const commits = runGit(["rev-list", "--reverse", `${baseSha}..${headSha}`])
    .trim()
    .split(/\r?\n/)
    .filter(Boolean);

  if (commits.length === 0) {
    throw new Error("El rango no contiene commits del PR para validar.");
  }

  const invalid: string[] = [];
  for (const sha of commits) {
    if (!commitShaPattern.test(sha)) {
      throw new Error("Git devolvió una referencia de commit inesperada.");
    }
    // Los mensajes se leen como datos; nunca se ejecutan mediante un shell.
    const message = runGit(["show", "--no-patch", "--format=%B", sha]);
    if (!hasTaskReference(message)) invalid.push(sha);
  }

  return { checked: commits.length, invalid };
}

function main(): void {
  try {
    const { checked, invalid } = validateTaskCommits(process.env.PR_BASE_SHA, process.env.PR_HEAD_SHA);
    if (invalid.length > 0) {
      console.error("Cada commit del PR debe incluir una referencia como TSK-17 o #TSK-17.");
      for (const sha of invalid) console.error(`Commit sin referencia TSK válida: ${sha}`);
      process.exitCode = 1;
      return;
    }
    console.log(`${checked} commits comprobados: todos incluyen una referencia TSK válida.`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : "No se pudieron comprobar los commits del PR.");
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main();
}
