import test from "ava"
import { getTestCLI } from "tests/fixtures/get-test-cli"
import os from "node:os"
import path from "node:path"
import { randomUUID } from "node:crypto"
import { fileURLToPath } from "node:url"

test("CLI bundle command requires an output path", async (t) => {
  const cli = await getTestCLI(t)

  const result = await cli.executeCommand(["bundle"])
  t.is(result.exitCode, 1)
})

test("CLI bundle command produces a bundle", async (t) => {
  const cli = await getTestCLI(t)

  const tempPath = path.join(os.tmpdir(), `${randomUUID()}.js`)
  const appDirectoryPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "../smoke/api"
  )
  const result = await cli.executeCommand([
    "bundle",
    "-o",
    tempPath,
    "--app-directory",
    appDirectoryPath,
  ])
  t.is(result.exitCode, 0)

  const bundle = await import(tempPath)
  t.truthy(bundle.default.routeMapWithHandlers)
})
