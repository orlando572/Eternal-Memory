import assert from "node:assert/strict";
import test from "node:test";
import { hasTaskReference, validateTaskCommits } from "./validate-task-commits.mts";

const baseSha = "a".repeat(40);
const firstSha = "b".repeat(40);
const headSha = "c".repeat(40);

test("acepta referencias TSK con y sin numeral para distintas tareas", () => {
  for (const message of [
    "Configuración de integración continua TSK-17",
    "Configuración de integración continua #TSK-17",
    "Implementación de acceso #TSK-01 #TSK-02",
    "Corrección TSK-09",
    "Actualización\n\nRelacionado con #TSK-17.",
    "Cambios (TSK-100)",
  ]) {
    assert.equal(hasTaskReference(message), true, message);
  }
});

test("rechaza referencias incompletas, incrustadas o sin número válido", () => {
  for (const message of [
    "Actualización sin tarea", "TSK-", "TSK-00", "TSK-1", "TSK-017",
    "OTSK-17", "préTSK-17", "TSK-17abc", "TSK-17_otro", "TSK-17-otro",
    "##TSK-17", "tsk-17", "TSK-17ñ",
  ]) {
    assert.equal(hasTaskReference(message), false, message);
  }
});

test("comprueba todos los commits usando exclusivamente el rango base..head", () => {
  const calls = [];
  const result = validateTaskCommits(baseSha, headSha, (args) => {
    calls.push(args);
    if (args[0] === "rev-list") return `${firstSha}\r\n${headSha}\r\n`;
    return args.at(-1) === firstSha ? "Primero TSK-17" : "Segundo #TSK-02";
  });

  assert.deepEqual(result, { checked: 2, invalid: [] });
  assert.deepEqual(calls, [
    ["rev-list", "--reverse", `${baseSha}..${headSha}`],
    ["show", "--no-patch", "--format=%B", firstSha],
    ["show", "--no-patch", "--format=%B", headSha],
  ]);
});

test("identifica un commit inválido aunque otro sí incluya TSK", () => {
  const result = validateTaskCommits(baseSha, headSha, (args) => {
    if (args[0] === "rev-list") return `${firstSha}\n${headSha}\n`;
    return args.at(-1) === firstSha ? "Sin código de tarea" : "Cambio #TSK-17";
  });
  assert.deepEqual(result, { checked: 2, invalid: [firstSha] });
});

test("trata los caracteres de shell del mensaje como datos", () => {
  const result = validateTaskCommits(baseSha, headSha, (args) => {
    if (args[0] === "rev-list") return headSha;
    return "Cambio #TSK-17 $(comando) `comando` ; otro";
  });
  assert.deepEqual(result, { checked: 1, invalid: [] });
});

test("rechaza SHA ausentes o inválidos antes de ejecutar Git", () => {
  for (const [base, head] of [
    [undefined, headSha], [baseSha, undefined], ["develop", headSha],
    [baseSha, "HEAD; comando"], ["a".repeat(41), headSha],
  ]) {
    assert.throws(() => validateTaskCommits(base, head, () => {
      assert.fail("Git no debe ejecutarse con referencias inválidas");
    }), /SHA completos/);
  }
});

test("no aprueba silenciosamente un rango vacío", () => {
  assert.throws(() => validateTaskCommits(baseSha, headSha, () => "\n"), /no contiene commits/);
});

test("propaga los errores de Git y rechaza su salida inesperada", () => {
  assert.throws(() => validateTaskCommits(baseSha, headSha, () => {
    throw new Error("Objeto Git no disponible");
  }), /Objeto Git no disponible/);
  assert.throws(() => validateTaskCommits(baseSha, headSha, () => "--unexpected-ref"), /inesperada/);
});
